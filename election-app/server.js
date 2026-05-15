const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { db, initDB, getResults } = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

// Multer: candidate photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `candidate_${Date.now()}_${Math.random().toString(36).slice(2, 7)}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Images only'));
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve xlsx browser build for offline Excel import/export
app.get('/js/xlsx.min.js', (req, res) => {
  const p = path.join(__dirname, 'node_modules', 'xlsx', 'dist', 'xlsx.full.min.js');
  if (fs.existsSync(p)) res.sendFile(p);
  else res.status(404).send('// xlsx not installed — run npm install');
});

function getLocalIPs() {
  const result = [];
  for (const iface of Object.values(os.networkInterfaces())) {
    for (const net of iface) {
      if (net.family === 'IPv4' && !net.internal) result.push(net.address);
    }
  }
  return result;
}

// ─── Server info ──────────────────────────────────────────────────────────────
app.get('/api/server-info', (req, res) => {
  res.json({ ips: getLocalIPs(), port: PORT });
});

// ─── Elections ────────────────────────────────────────────────────────────────
app.get('/api/elections', (req, res) => {
  res.json(db.prepare('SELECT * FROM elections ORDER BY created_at DESC').all());
});

app.get('/api/elections/active', (req, res) => {
  res.json(db.prepare("SELECT * FROM elections WHERE status='active' LIMIT 1").get() || null);
});

app.post('/api/elections', (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name required' });
  const r = db.prepare("INSERT INTO elections (name) VALUES (?)").run(name.trim());
  res.json({ id: r.lastInsertRowid, name: name.trim(), status: 'setup' });
});

app.put('/api/elections/:id', (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name required' });
  db.prepare('UPDATE elections SET name=? WHERE id=?').run(name.trim(), req.params.id);
  res.json({ success: true });
});

app.put('/api/elections/:id/status', (req, res) => {
  const { status } = req.body;
  if (!['setup', 'active', 'closed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  if (status === 'active') {
    db.prepare("UPDATE elections SET status='setup' WHERE status='active'").run();
  }
  db.prepare('UPDATE elections SET status=? WHERE id=?').run(status, req.params.id);
  const election = db.prepare('SELECT * FROM elections WHERE id=?').get(req.params.id);
  io.emit('election-status-changed', election);
  res.json(election);
});

app.delete('/api/elections/:id', (req, res) => {
  db.prepare('DELETE FROM elections WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

// ─── Positions ────────────────────────────────────────────────────────────────
app.get('/api/elections/:eid/positions', (req, res) => {
  const positions = db.prepare(
    'SELECT * FROM positions WHERE election_id=? ORDER BY order_index, id'
  ).all(req.params.eid);

  for (const p of positions) {
    p.candidates = db.prepare(
      'SELECT * FROM candidates WHERE position_id=? ORDER BY order_index, id'
    ).all(p.id);
  }
  res.json(positions);
});

app.post('/api/positions', (req, res) => {
  const { election_id, name, description, min_yes, max_yes } = req.body;
  if (!election_id || !name?.trim()) return res.status(400).json({ error: 'election_id and name required' });
  const r = db.prepare(
    'INSERT INTO positions (election_id, name, description, min_yes, max_yes) VALUES (?,?,?,?,?)'
  ).run(election_id, name.trim(), description || '', parseInt(min_yes) || 1, parseInt(max_yes) || 1);
  res.json({ id: r.lastInsertRowid, election_id, name: name.trim(), description: description || '',
    min_yes: parseInt(min_yes) || 1, max_yes: parseInt(max_yes) || 1, candidates: [] });
});

app.put('/api/positions/:id', (req, res) => {
  const { name, description, min_yes, max_yes } = req.body;
  db.prepare('UPDATE positions SET name=?, description=?, min_yes=?, max_yes=? WHERE id=?')
    .run(name.trim(), description || '', parseInt(min_yes) || 1, parseInt(max_yes) || 1, req.params.id);
  res.json({ success: true });
});

app.delete('/api/positions/:id', (req, res) => {
  db.prepare('DELETE FROM positions WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

// ─── Candidates ───────────────────────────────────────────────────────────────
app.post('/api/candidates', upload.single('photo'), (req, res) => {
  const { position_id, name, bio } = req.body;
  if (!position_id || !name?.trim()) return res.status(400).json({ error: 'position_id and name required' });
  const photo = req.file?.filename || null;
  const r = db.prepare(
    'INSERT INTO candidates (position_id, name, photo, bio) VALUES (?,?,?,?)'
  ).run(position_id, name.trim(), photo, bio || '');
  res.json({ id: r.lastInsertRowid, position_id, name: name.trim(), photo, bio: bio || '' });
});

app.put('/api/candidates/:id', upload.single('photo'), (req, res) => {
  const { name, bio } = req.body;
  const existing = db.prepare('SELECT * FROM candidates WHERE id=?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const photo = req.file ? req.file.filename : existing.photo;
  if (req.file && existing.photo) {
    const old = path.join(__dirname, 'uploads', existing.photo);
    if (fs.existsSync(old)) fs.unlinkSync(old);
  }
  db.prepare('UPDATE candidates SET name=?, photo=?, bio=? WHERE id=?')
    .run(name.trim(), photo, bio || '', req.params.id);
  res.json({ success: true });
});

app.delete('/api/candidates/:id', (req, res) => {
  const c = db.prepare('SELECT * FROM candidates WHERE id=?').get(req.params.id);
  if (c?.photo) {
    const f = path.join(__dirname, 'uploads', c.photo);
    if (fs.existsSync(f)) fs.unlinkSync(f);
  }
  db.prepare('DELETE FROM candidates WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

// ─── Booths ───────────────────────────────────────────────────────────────────
app.get('/api/booths', (req, res) => {
  res.json(db.prepare('SELECT * FROM booths ORDER BY name').all());
});

app.post('/api/booths', (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name required' });
  const token = `B${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const r = db.prepare('INSERT INTO booths (name, token) VALUES (?,?)').run(name.trim(), token);
  res.json({ id: r.lastInsertRowid, name: name.trim(), token, active: 1 });
});

app.delete('/api/booths/:id', (req, res) => {
  db.prepare('DELETE FROM booths WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

// ─── Voters ───────────────────────────────────────────────────────────────────
app.get('/api/elections/:eid/voters', (req, res) => {
  res.json(db.prepare('SELECT * FROM voters WHERE election_id=? ORDER BY name').all(req.params.eid));
});

app.get('/api/elections/:eid/voters/search', (req, res) => {
  const q = `%${req.query.q || ''}%`;
  res.json(db.prepare(
    'SELECT * FROM voters WHERE election_id=? AND (name LIKE ? OR voter_id LIKE ?) ORDER BY name LIMIT 20'
  ).all(req.params.eid, q, q));
});

app.post('/api/elections/:eid/voters', (req, res) => {
  const { name, voter_id } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name required' });
  const vid = voter_id?.trim() || `V${Date.now()}`;
  try {
    const r = db.prepare(
      'INSERT INTO voters (election_id, voter_id, name) VALUES (?,?,?)'
    ).run(req.params.eid, vid, name.trim());
    res.json({ id: r.lastInsertRowid, election_id: req.params.eid, voter_id: vid, name: name.trim() });
  } catch (e) {
    res.status(409).json({ error: 'Voter ID already exists' });
  }
});

app.post('/api/elections/:eid/voters/bulk', (req, res) => {
  const { voters } = req.body;
  if (!Array.isArray(voters)) return res.status(400).json({ error: 'voters must be array' });
  const ins = db.prepare('INSERT OR IGNORE INTO voters (election_id, voter_id, name) VALUES (?,?,?)');
  const run = db.transaction(() => {
    let n = 0;
    for (const v of voters) {
      if (!v.name?.trim()) continue;
      const vid = v.voter_id?.trim() || `V${Date.now()}_${n}`;
      ins.run(req.params.eid, vid, v.name.trim());
      n++;
    }
    return n;
  });
  res.json({ imported: run() });
});

app.delete('/api/elections/:eid/voters', (req, res) => {
  db.prepare('DELETE FROM voters WHERE election_id=?').run(req.params.eid);
  res.json({ success: true });
});

// ─── Ballot (for booth) ───────────────────────────────────────────────────────
app.get('/api/elections/:eid/ballot', (req, res) => {
  const election = db.prepare("SELECT * FROM elections WHERE id=?").get(req.params.eid);
  if (!election) return res.status(404).json({ error: 'Not found' });
  const positions = db.prepare(
    'SELECT * FROM positions WHERE election_id=? ORDER BY order_index, id'
  ).all(req.params.eid);
  for (const p of positions) {
    p.candidates = db.prepare(
      'SELECT * FROM candidates WHERE position_id=? ORDER BY order_index, id'
    ).all(p.id);
  }
  const hasVoterList = db.prepare(
    'SELECT COUNT(*) as n FROM voters WHERE election_id=?'
  ).get(req.params.eid).n > 0;
  res.json({ election, positions, hasVoterList });
});

// ─── Vote submission ───────────────────────────────────────────────────────────
app.post('/api/vote', (req, res) => {
  const { election_id, booth_id, voter_id, votes } = req.body;
  if (!election_id || !booth_id || !Array.isArray(votes)) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const election = db.prepare("SELECT * FROM elections WHERE id=? AND status='active'").get(election_id);
  if (!election) return res.status(400).json({ error: 'Election is not active' });

  if (voter_id) {
    const voter = db.prepare('SELECT * FROM voters WHERE election_id=? AND voter_id=?')
      .get(election_id, voter_id);
    if (voter?.has_voted) return res.status(409).json({ error: 'This voter has already cast their vote' });
  }

  // Validate min/max yes per position
  const positions = db.prepare('SELECT * FROM positions WHERE election_id=?').all(election_id);
  for (const pos of positions) {
    const posVotes = votes.filter(v => v.position_id === pos.id);
    if (posVotes.length === 0) continue;
    const yesCount = posVotes.filter(v => v.vote === 'yes').length;
    if (yesCount < pos.min_yes || yesCount > pos.max_yes) {
      return res.status(400).json({
        error: `"${pos.name}": need ${pos.min_yes}–${pos.max_yes} YES votes, got ${yesCount}`
      });
    }
  }

  const submit = db.transaction(() => {
    const session = db.prepare(
      'INSERT INTO vote_sessions (election_id, booth_id, voter_id) VALUES (?,?,?)'
    ).run(election_id, booth_id, voter_id || null);

    const insVote = db.prepare(
      'INSERT INTO votes (session_id, election_id, candidate_id, position_id, vote) VALUES (?,?,?,?,?)'
    );
    for (const v of votes) {
      insVote.run(session.lastInsertRowid, election_id, v.candidate_id, v.position_id, v.vote);
    }

    if (voter_id) {
      db.prepare(
        'UPDATE voters SET has_voted=1, voted_at=CURRENT_TIMESTAMP, booth_id=? WHERE election_id=? AND voter_id=?'
      ).run(booth_id, election_id, voter_id);
    }
    return session.lastInsertRowid;
  });

  try {
    const sessionId = submit();
    const results = getResults(election_id);
    io.emit('results-updated', { election_id, results });
    const totalSessions = db.prepare(
      'SELECT COUNT(*) as n FROM vote_sessions WHERE election_id=?'
    ).get(election_id).n;
    io.emit('vote-cast', { election_id, booth_id, total_sessions: totalSessions });
    res.json({ success: true, session_id: sessionId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Results ──────────────────────────────────────────────────────────────────
app.get('/api/elections/:eid/results', (req, res) => {
  const r = getResults(req.params.eid);
  if (!r) return res.status(404).json({ error: 'Not found' });
  res.json(r);
});

// ─── Socket.io ────────────────────────────────────────────────────────────────
io.on('connection', socket => {
  console.log(`[socket] connected ${socket.id}`);
  socket.on('disconnect', () => console.log(`[socket] disconnected ${socket.id}`));
});

// ─── Start ────────────────────────────────────────────────────────────────────
initDB();
server.listen(PORT, '0.0.0.0', () => {
  const ips = getLocalIPs();
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║        Community Election System — Ready         ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(`\n  Admin console:  http://localhost:${PORT}/admin.html`);
  if (ips.length) {
    console.log(`\n  Booth URL for tablets on same WiFi:`);
    ips.forEach(ip => console.log(`    http://${ip}:${PORT}/booth.html`));
  }
  console.log('\n  No internet connection required.\n');
});

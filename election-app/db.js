const fs      = require('fs');
const path    = require('path');
const initSql = require('sql.js');

const DB_PATH = path.join(__dirname, 'election.db');
let _db = null;
let _inTx = false;   // suppress mid-transaction disk writes

// ─── Disk persistence ─────────────────────────────────────────────────────────
function persist() {
  if (_db && !_inTx) fs.writeFileSync(DB_PATH, Buffer.from(_db.export()));
}

// ─── Normalise calling conventions ────────────────────────────────────────────
// Accepts both .run(a, b, c) and .run([a, b, c]) like better-sqlite3
function normParams(args) {
  if (args.length === 0)                                    return [];
  if (args.length === 1 && Array.isArray(args[0]))          return args[0];
  return Array.from(args);
}

// ─── Statement wrapper ────────────────────────────────────────────────────────
class Stmt {
  constructor(sql) { this._sql = sql; }

  run(...args) {
    _db.run(this._sql, normParams(args));
    const r = _db.exec('SELECT last_insert_rowid(), changes()');
    const [rid, chg] = r[0]?.values[0] ?? [0, 0];
    persist();
    return { lastInsertRowid: rid, changes: chg };
  }

  get(...args) {
    const stmt = _db.prepare(this._sql);
    try {
      stmt.bind(normParams(args));
      return stmt.step() ? stmt.getAsObject() : undefined;
    } finally { stmt.free(); }
  }

  all(...args) {
    const stmt = _db.prepare(this._sql);
    const rows = [];
    try {
      stmt.bind(normParams(args));
      while (stmt.step()) rows.push(stmt.getAsObject());
    } finally { stmt.free(); }
    return rows;
  }
}

// ─── Database proxy (matches the better-sqlite3 surface used in server.js) ───
const db = {
  prepare(sql) { return new Stmt(sql); },

  exec(sql) { _db.exec(sql); persist(); return db; },

  pragma() { return db; },   // WAL not needed with manual file persistence

  transaction(fn) {
    return function (...args) {
      _db.run('BEGIN');
      _inTx = true;
      try {
        const result = fn(...args);
        _db.run('COMMIT');
        _inTx = false;
        persist();
        return result;
      } catch (e) {
        _inTx = false;
        try { _db.run('ROLLBACK'); } catch {}
        throw e;
      }
    };
  }
};

// ─── Schema ───────────────────────────────────────────────────────────────────
async function initDB() {
  const SQL = await initSql();
  _db = fs.existsSync(DB_PATH)
    ? new SQL.Database(fs.readFileSync(DB_PATH))
    : new SQL.Database();

  _db.exec(`
    CREATE TABLE IF NOT EXISTS elections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      status TEXT DEFAULT 'setup',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS positions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      election_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      min_yes INTEGER DEFAULT 1,
      max_yes INTEGER DEFAULT 1,
      order_index INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS candidates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      position_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      photo TEXT,
      bio TEXT DEFAULT '',
      order_index INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS booths (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS voters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      election_id INTEGER NOT NULL,
      voter_id TEXT NOT NULL,
      name TEXT NOT NULL,
      has_voted INTEGER DEFAULT 0,
      voted_at DATETIME,
      booth_id INTEGER,
      UNIQUE(election_id, voter_id)
    );
    CREATE TABLE IF NOT EXISTS vote_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      election_id INTEGER NOT NULL,
      booth_id INTEGER NOT NULL,
      voter_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      election_id INTEGER NOT NULL,
      candidate_id INTEGER NOT NULL,
      position_id INTEGER NOT NULL,
      vote TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  persist();
}

// ─── Results query ────────────────────────────────────────────────────────────
function getResults(electionId) {
  const election = db.prepare('SELECT * FROM elections WHERE id=?').get(electionId);
  if (!election) return null;

  const positions = db.prepare(
    'SELECT * FROM positions WHERE election_id=? ORDER BY order_index, id'
  ).all(electionId);

  const total_sessions = db.prepare(
    'SELECT COUNT(*) as n FROM vote_sessions WHERE election_id=?'
  ).get(electionId)?.n ?? 0;

  const total_voters = db.prepare(
    'SELECT COUNT(*) as n FROM voters WHERE election_id=?'
  ).get(electionId)?.n ?? 0;

  const voted_voters = db.prepare(
    'SELECT COUNT(*) as n FROM voters WHERE election_id=? AND has_voted=1'
  ).get(electionId)?.n ?? 0;

  for (const pos of positions) {
    const candidates = db.prepare(
      'SELECT * FROM candidates WHERE position_id=? ORDER BY order_index, id'
    ).all(pos.id);

    for (const c of candidates) {
      c.yes_count = db.prepare(
        "SELECT COUNT(*) as n FROM votes WHERE candidate_id=? AND vote='yes' AND election_id=?"
      ).get(c.id, electionId)?.n ?? 0;
      c.no_count = db.prepare(
        "SELECT COUNT(*) as n FROM votes WHERE candidate_id=? AND vote='no' AND election_id=?"
      ).get(c.id, electionId)?.n ?? 0;
      c.total = c.yes_count + c.no_count;
    }

    candidates.sort((a, b) => b.yes_count - a.yes_count);
    pos.candidates = candidates;
  }

  return { election, positions, total_sessions, total_voters, voted_voters };
}

module.exports = { db, initDB, getResults };

const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'election.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDB() {
  db.exec(`
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
      order_index INTEGER DEFAULT 0,
      FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS candidates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      position_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      photo TEXT,
      bio TEXT DEFAULT '',
      order_index INTEGER DEFAULT 0,
      FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE CASCADE
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
      UNIQUE(election_id, voter_id),
      FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE
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
      vote TEXT NOT NULL CHECK(vote IN ('yes', 'no')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES vote_sessions(id),
      FOREIGN KEY (candidate_id) REFERENCES candidates(id),
      FOREIGN KEY (election_id) REFERENCES elections(id)
    );
  `);
}

function getResults(electionId) {
  const election = db.prepare('SELECT * FROM elections WHERE id = ?').get(electionId);
  if (!election) return null;

  const positions = db.prepare(
    'SELECT * FROM positions WHERE election_id = ? ORDER BY order_index, id'
  ).all(electionId);

  const totalSessions = db.prepare(
    'SELECT COUNT(*) as count FROM vote_sessions WHERE election_id = ?'
  ).get(electionId).count;

  const totalVoters = db.prepare(
    'SELECT COUNT(*) as count FROM voters WHERE election_id = ?'
  ).get(electionId).count;

  const votedVoters = db.prepare(
    'SELECT COUNT(*) as count FROM voters WHERE election_id = ? AND has_voted = 1'
  ).get(electionId).count;

  for (const pos of positions) {
    const candidates = db.prepare(
      'SELECT * FROM candidates WHERE position_id = ? ORDER BY order_index, id'
    ).all(pos.id);

    for (const c of candidates) {
      c.yes_count = db.prepare(
        "SELECT COUNT(*) as n FROM votes WHERE candidate_id = ? AND vote = 'yes' AND election_id = ?"
      ).get(c.id, electionId).n;
      c.no_count = db.prepare(
        "SELECT COUNT(*) as n FROM votes WHERE candidate_id = ? AND vote = 'no' AND election_id = ?"
      ).get(c.id, electionId).n;
      c.total = c.yes_count + c.no_count;
    }

    candidates.sort((a, b) => b.yes_count - a.yes_count);
    pos.candidates = candidates;
  }

  return { election, positions, total_sessions: totalSessions, total_voters: totalVoters, voted_voters: votedVoters };
}

module.exports = { db, initDB, getResults };

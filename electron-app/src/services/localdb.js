import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

let db;

export function initLocalDb(userDataPath = process.cwd()) {
  fs.mkdirSync(userDataPath, { recursive: true });
  db = new Database(path.join(userDataPath, "vr-assistant.sqlite"));
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      metadata TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS user_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS user_memory (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS api_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  return { ok: true };
}

function ensureDb() {
  if (!db) initLocalDb();
  return db;
}

export function saveMessage({ role, content, metadata = {} }) {
  const info = ensureDb()
    .prepare("INSERT INTO chat_history (role, content, metadata) VALUES (?, ?, ?)")
    .run(role, content, JSON.stringify(metadata));
  return { id: info.lastInsertRowid };
}

export function getMessages(limit = 20) {
  return ensureDb()
    .prepare("SELECT id, role, content, metadata, created_at FROM chat_history ORDER BY id DESC LIMIT ?")
    .all(Number(limit))
    .reverse()
    .map((row) => ({ ...row, metadata: JSON.parse(row.metadata || "{}") }));
}

export function setSetting(key, value) {
  ensureDb()
    .prepare(
      "INSERT INTO user_settings (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')"
    )
    .run(String(key), JSON.stringify(value));
  return { ok: true };
}

export function getSettings() {
  const rows = ensureDb().prepare("SELECT key, value FROM user_settings").all();
  return Object.fromEntries(rows.map((row) => [row.key, JSON.parse(row.value)]));
}

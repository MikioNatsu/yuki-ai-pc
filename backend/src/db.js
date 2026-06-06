const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

function resolveSqlitePath(databaseUrl = "./data/vr-assistant.sqlite") {
  if (databaseUrl === ":memory:") return databaseUrl;
  if (databaseUrl.startsWith("sqlite://")) return databaseUrl.slice("sqlite://".length);
  return path.isAbsolute(databaseUrl) ? databaseUrl : path.resolve(process.cwd(), databaseUrl);
}

function createDatabase(databaseUrl) {
  const dbPath = resolveSqlitePath(databaseUrl);
  if (dbPath !== ":memory:") {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  runMigrations(db);
  return db;
}

function runMigrations(db) {
  const migrationsDir = path.resolve(__dirname, "../migrations");
  for (const file of fs.readdirSync(migrationsDir).filter((name) => name.endsWith(".sql")).sort()) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    db.exec(sql);
  }
}

module.exports = { createDatabase, resolveSqlitePath };

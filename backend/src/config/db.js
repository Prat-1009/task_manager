import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';

sqlite3.verbose();

const dbFile = process.env.DB_PATH || './database.sqlite';
const dir = path.dirname(dbFile);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}
const db = new sqlite3.Database(dbFile);

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'user'
    )`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      createdBy INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(createdBy) REFERENCES users(id) ON DELETE CASCADE
    )`
  );
});

export const runAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });

export const getAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });

export const allAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });

export default db;

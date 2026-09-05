'use strict';

const assert = require('node:assert/strict');
const path = require('path');

const BACKEND_DIR = path.resolve(
  __dirname,
  '../../../edu-learn-project/backend'
);

const DB_PATH = path.join(
  BACKEND_DIR,
  'database.sqlite'
);

const sqlite3 = require(
  path.join(BACKEND_DIR, 'node_modules', 'sqlite3')
);

const { open } = require(
  path.join(BACKEND_DIR, 'node_modules', 'sqlite')
);

async function openDb(filename = DB_PATH) {
  const db = await open({
    filename,
    driver: sqlite3.Database
  });

  await db.run('PRAGMA foreign_keys = ON;');

  return db;
}

module.exports = {
  assert,
  path,
  BACKEND_DIR,
  DB_PATH,
  sqlite3,
  open,
  openDb
};
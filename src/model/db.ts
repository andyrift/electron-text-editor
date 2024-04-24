import fs from 'fs'
import BetterSqlite3 from 'better-sqlite3';
import { Model } from './dbModel';

export const initDB = () => {
  if (!fs.existsSync('database/')) fs.mkdirSync('database/');
  const db = BetterSqlite3('database/database.db');
  db.pragma('journal_mode = WAL');

  const model = new Model(db);
  return model;
}
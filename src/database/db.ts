import fs from 'fs/promises'
import BetterSqlite3 from 'better-sqlite3'
import { Model } from './model'

export const initDB = async (path: string, name: string) => {
  await fs.mkdir(path, { recursive: true })
  const db = BetterSqlite3(path + name)
  db.pragma('journal_mode = WAL')
  return new Model(db)
}
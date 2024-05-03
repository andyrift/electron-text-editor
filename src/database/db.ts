import fs from 'fs/promises'
import BetterSqlite3 from 'better-sqlite3'
import { DBModel } from './model'

export async function initDB (path: string, name: string) {
  await fs.mkdir(path, { recursive: true })
  const db = BetterSqlite3(path + name)
  db.pragma('journal_mode = WAL')
  try {
    const model = await new Promise<DBModel>((resolve, reject) => {
      const model = new DBModel(db, (status) => {
        if(status) resolve(model)
        else reject("Model init failed")
      });
    })
    return model
  } catch (err) {
    console.log(err)
    return null
  }
}
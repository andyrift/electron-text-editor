import fs from 'fs/promises'
import BetterSqlite3 from 'better-sqlite3'
import { Model } from './model'

export async function initDB (path: string, name: string) {
  await fs.mkdir(path, { recursive: true })
  const db = BetterSqlite3(path + name)
  db.pragma('journal_mode = WAL')
  try {
    const model = await new Promise<Model>((resolve, reject) => {
      const model = new Model(db, (status) => {
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
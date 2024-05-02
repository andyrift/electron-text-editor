import type { Database, RunResult } from "better-sqlite3"

import sqlRAW from "./database.sql?raw"

export type EditorStateJson = any;
export type DocumentJson = any;

export type Page = {
  id: number
  title: string | null
  last_saved: number
  deleted: number | null
  folder: number | null
}

export type Folder = {
  id: number
  name: string | null
  folder: number | null
}

export type PageData = {
  id: number
  document: DocumentJson
  editor_state: EditorStateJson
}

// Template model types

export type DBResponse<T> = { status: true, value: T } | { status: false, value: string }
type DBPromise<T> = Promise<DBResponse<T>>

export class Model {
  db: Database

  async init() {
    this.db.exec(sqlRAW);
  }

  constructor(db: Database, callback: (status: boolean) => void) {
    this.db = db
    this.init().then(() => {
      callback(true)
    }).catch((err) => {
      console.log(err)
      callback(false)
    })
  }

  async run(query: string): DBPromise<any> {
    try {
      return { status: true, value: await this.db.prepare(query).run() }
    } catch (err: any) {
      return { status: false, value: err.toString() }
    }
  }

  async get(query: string): DBPromise<any> {
    try {
      return { status: true, value: await this.db.prepare(query).get() }
    } catch (err: any) {
      return { status: false, value: err.toString() }
    }
  }

  async all(query: string): DBPromise<any[]> {
    try {
      return { status: true, value: await this.db.prepare(query).all() }
    } catch (err: any) {
      return { status: false, value: err.toString() }
    }
  }

  async createPage(document: DocumentJson, editor_state: EditorStateJson): DBPromise<{ id: number }> {
    const create_page = this.db.prepare(
      "insert into pages(title, last_saved) values (:title, unixepoch()) returning id"
    )
    const create_page_data = this.db.prepare(
      "insert into page_data(id, document, editor_state) values (:id, :document, :editor_state)"
    )
    const tr = this.db.transaction(async (document: string, editor_state: string) => {
      const res = await create_page.get({
        title: null
      }) as { id: number }
      await create_page_data.run({ id: res.id, document, editor_state })
      return res
    })

    try {
      return {
        status: true, 
        value: await tr(JSON.stringify(document), JSON.stringify(editor_state))
      }
    } catch (err: any) {
      return { status: false, value: err.toString() }
    }
  }

  async savePage(title: string | null, document: DocumentJson, editor_state: EditorStateJson): DBPromise<{ saved: number }> {
    
    const update_page = this.db.prepare(
      "update pages set title = :title, saved = unixepoch() where id = :id returning saved"
    )
    const update_page_data = this.db.prepare(
      "update page_data set document = :document, editor_state = :editor_state"
    )

    const tr = this.db.transaction(async (title: string | null, document: string, editor_state: string) => {
      const res = await update_page.get({ title }) as { saved: number }
      await update_page_data.run({ document, editor_state })
      return res
    })

    try {
      return {
        status: true,
        value: await tr(title, JSON.stringify(document), JSON.stringify(editor_state))
      }
    } catch (err: any) {
      return { status: false, value: err.toString() }
    }
  }

  async getAllPagesNotDel(): DBPromise<Page[]> {
    const query = "select id, title, folder, saved, deleted from pages where deleted is null"

    try {
      return { status: true, value: await this.db.prepare(query).all() as Page[] }
    } catch (err: any) {
      return { status: false, value: err.toString() }
    }
  }

  async getAllPagesDel(): DBPromise<Page[]> {
    const query = "select id, title, saved, deleted, folder from pages where deleted is not null"

    try {
      return { status: true, value: await this.db.prepare(query).all() as Page[] }
    } catch (err: any) {
      return { status: false, value: err.toString() }
    }
  }

  async getAllPages(deleted: boolean) {
    if (deleted) return this.getAllPagesDel()
    else return this.getAllPagesNotDel()
  }

  async getPage(id: number): DBPromise<Page> {
    const query = "select id, data, title, saved, deleted, folder from pages where id = :id"
    let params = { id }

    try {
      let res: any = await this.db.prepare(query).get(params)
      res.data = JSON.parse(res.data)

      return { status: true, value: res as Page }
    } catch (err: any) {
      return { status: false, value: err.toString() }
    }
  }

  async getPageData(id: number): DBPromise<PageData> {
    const query = "select id, document, editor_state from page_data where id = :id"
    let params = { id }

    try {
      let res: any = await this.db.prepare(query).get(params)
      res.document = JSON.parse(res.document)
      res.editor_state = JSON.parse(res.editor_state)

      return { status: true, value: res as PageData }
    } catch (err: any) {
      return { status: false, value: err.toString() }
    }
  }

  async trashPage(id: number): DBPromise<RunResult> {
    const query = "update pages set deleted = unixepoch() where id = :id"
    let params = { id }

    try {
      return {
        status: true, value: await this.db.prepare(query).run(params)
      };
    } catch (err: any) {
      return { status: false, value: err.toString() }
    }
  }

  async restorePage(id: number): DBPromise<RunResult> {
    const query = "update pages set deleted = null where id = :id"
    let params = { id };

    try {
      return {
        status: true, value: await this.db.prepare(query).run(params)
      }
    } catch (err: any) {
      return { status: false, value: err.toString() }
    }
  }

  async deletePage(id: number): DBPromise<RunResult> {
    const query = "delete from pages where id = :id"
    let params = { id };

    try {
      return {
        status: true, value: await this.db.prepare(query).run(params)
      };
    } catch (err: any) {
      return { status: false, value: err.toString() }
    }
  }

  async getAllFolders(): DBPromise<Folder[]> {
    const query = "select id, name, folder from folders"

    try {
      return { status: true, value: await this.db.prepare(query).all() as Folder[] }
    } catch (err: any) {
      return { status: false, value: err.toString() }
    }
  }

  async renameFolder(folder: Folder): DBPromise<RunResult> {
    const query = "update folders set name = :name where id = :id"
    let params = { id: folder.id, name: folder.name }

    try {
      return { status: true, value: await this.db.prepare(query).run(params) }
    } catch (err: any) {
      return { status: false, value: err.toString() }
    }
  }

  async createFolder(): DBPromise<{ id: number }> {
    const query = "insert into folders(name) values (null) returning id"

    try {
      return {
        status: true, 
        value: await this.db.prepare(query).get() as { id: number }
      };
    } catch (err: any) {
      return { status: false, value: err.toString() }
    }
  }

  async deleteFolder(id: number): DBPromise<RunResult> {
    const query = "delete from folders where id = :id"
    const params = { id }

    try {
      return { status: true, value: await this.db.prepare(query).run(params) }
    } catch (err: any) {
      return { status: false, value: err.toString() }
    }
  }

  async changePageFolder(child: number, parent: number | null): DBPromise<RunResult> {
    const query = "update pages set folder = :parent where id =:child"
    const params = { child, parent }

    try {
      return { status: true, value: await this.db.prepare(query).run(params) }
    } catch (err: any) {
      return { status: false, value: err.toString() }
    }
  }

  async changeFolderFolder(child: number, parent: number | null): DBPromise<RunResult> {
    const query = "update folders set folder = :parent where id =:child"
    const params = { child, parent }

    try {
      return { status: true, value: await this.db.prepare(query).run(params) }
    } catch (err: any) {
      return { status: false, value: err.toString() }
    }
  }
}
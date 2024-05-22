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

export type DBResponse<T> = { 
  status: true, 
  value: T 
} | { 
  status: false, 
  value: string 
}

export type DBPromise<T> = Promise<DBResponse<T>>

export interface IDBModel {
  run(query: string): DBPromise<any>
  get(query: string): DBPromise<any>
  all(query: string): DBPromise<any[]>

  createPage(document: DocumentJson, editor_state: EditorStateJson): DBPromise<{ id: number }>
  savePage(id: number, title: string | null, document: DocumentJson, editor_state: EditorStateJson): DBPromise<{ last_saved: number }>

  getAllPagesNotDel(): DBPromise<Page[]>
  getAllPagesDel(): DBPromise<Page[]>
  getAllPages(deleted: boolean): DBPromise<Page[]>
  getPage(id: number): DBPromise<Page>

  getPageData(id: number): DBPromise<PageData>

  trashPage(id: number): DBPromise<RunResult>
  restorePage(id: number): DBPromise<RunResult>
  deletePage(id: number): DBPromise<RunResult>

  getAllFolders(): DBPromise<Folder[]>
  renameFolder(id: number, name: string | null): DBPromise<RunResult>

  createFolder(): DBPromise<{ id: number }>
  deleteFolder(id: number): DBPromise<RunResult>

  changePageFolder(child: number, parent: number | null): DBPromise<RunResult>
  changeFolderFolder(child: number, parent: number | null): DBPromise<RunResult>
}

export class DBModel implements IDBModel {
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

  async savePage(id: number, title: string | null, document: DocumentJson, editor_state: EditorStateJson): DBPromise<{ last_saved: number }> {
    
    const update_page = this.db.prepare(
      "update pages set title = :title, last_saved = unixepoch() where id = :id returning last_saved"
    )
    const update_page_data = this.db.prepare(
      "update page_data set document = :document, editor_state = :editor_state where id = :id"
    )

    const tr = this.db.transaction(async (id: number, title: string | null, document: string, editor_state: string) => {
      const res = await update_page.get({ id, title }) as { last_saved: number }
      await update_page_data.run({ id, document, editor_state })
      return res
    })

    try {
      return {
        status: true,
        value: await tr(id, title, JSON.stringify(document), JSON.stringify(editor_state))
      }
    } catch (err: any) {
      return { status: false, value: err.toString() }
    }
  }

  async getAllPagesNotDel(): DBPromise<Page[]> {
    const query = "select id, title, folder, last_saved, deleted from pages where deleted is null"

    try {
      return { status: true, value: await this.db.prepare(query).all() as Page[] }
    } catch (err: any) {
      return { status: false, value: err.toString() }
    }
  }

  async getAllPagesDel(): DBPromise<Page[]> {
    const query = "select id, title, last_saved, deleted, folder from pages where deleted is not null"

    try {
      return { status: true, value: await this.db.prepare(query).all() as Page[] }
    } catch (err: any) {
      return { status: false, value: err.toString() }
    }
  }

  async getAllPages(deleted: boolean): DBPromise<Page[]> {
    if (deleted) return this.getAllPagesDel()
    else return this.getAllPagesNotDel()
  }

  async getPage(id: number): DBPromise<Page> {
    const query = "select id, title, last_saved, deleted, folder from pages where id = :id"
    let params = { id }
    try {
      return { 
        status: true, 
        value: await this.db.prepare(query).get(params) as Page 
      }
    } catch (err: any) {
      return { 
        status: false, 
        value: err.toString() 
      }
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

  async getFolder(id: number): DBPromise<Folder> {
    const query = "select id, name, folder from folders where id = :id"
    let params = { id };

    try {
      return { status: true, value: await this.db.prepare(query).get(params) as Folder }
    } catch (err: any) {
      return { status: false, value: err.toString() }
    }
  }

  async renameFolder(id: number, name: string | null): DBPromise<RunResult> {
    const query = "update folders set name = :name where id = :id"
    let params = { id, name }

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

  private async checkFolderLoop(child: number, parent: number) {
    const query = "select folder from folders where id = :child"
    const stmnt = this.db.prepare(query)

    var current: number | null = parent
    while (true) {
      if (current === null) break
      if (current == child) break
      const res = await stmnt.get({ child: current }) as { folder: number | null }
      current = res.folder
    }

    if (current === null) return true
    if (current == child) return false
    throw "could not resolve loop"
  }

  async changeFolderFolder(child: number, parent: number | null): DBPromise<RunResult> {
    const query = "update folders set folder = :parent where id =:child"
    const params = { child, parent }

    try {
      if (parent !== null) {
        if (!await this.checkFolderLoop(child, parent))
          return { status: false, value: "Folders cannot form a loop" }
      }
      return { status: true, value: await this.db.prepare(query).run(params) }
    } catch (err: any) {
      return { status: false, value: err.toString() }
    }
  }

  methods = {
    run: this.run,
    get: this.get,
    all: this.all,
    createPage: this.createPage,
    savePage: this.savePage,
    getAllPagesNotDel: this.getAllPagesNotDel,
    getAllPagesDel: this.getAllPagesDel,
    getAllPages: this.getAllPages,
    getPage: this.getPage,
    getPageData: this.getPageData,
    trashPage: this.trashPage,
    restorePage: this.restorePage,
    deletePage: this.deletePage,
    getAllFolders: this.getAllFolders,
    getFolder: this.getFolder,
    renameFolder: this.renameFolder,
    createFolder: this.createFolder,
    deleteFolder: this.deleteFolder,
    changePageFolder: this.changePageFolder,
    changeFolderFolder: this.changeFolderFolder
  }
}
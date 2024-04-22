import { Page, DBResponse, StateData, PageInfo, Folder } from "@types";
import type { Database, RunResult } from "better-sqlite3";

export class Model {
  db: Database;
  constructor(db: Database) {
    this.db = db;
    this.db.prepare("create table if not exists folders(id integer primary key autoincrement, name text)").run();
    this.db.prepare("create table if not exists pages(id integer primary key autoincrement, data not null, title text, saved integer not null, deleted integer, folder integer references folders on delete set null)").run();
  }

  async run(query: string) {
    try {
      return { status: true, res: await this.db.prepare(query).run() };
    } catch (err: any) {
      return { status: false, err: err.toString() };;
    }
  }

  async get(query: string) {
    try {
      return { status: true, res: await this.db.prepare(query).get() };
    } catch (err: any) {
      return { status: false, err: err.toString() };;
    }
  }

  async all(query: string) {
    try {
      return { status: true, res: await this.db.prepare(query).all() };
    } catch (err: any) {
      return { status: false, err: err.toString() };;
    }
  }

  async createPage(data: any): Promise<DBResponse<{ id: number }>> {
    const query = "insert into pages(data, title, saved) values (:data, :title, unixepoch()) returning id";
    let params = { data: JSON.stringify(data), title: null };

    try {
      return {
        status: true, res: await this.db.prepare(query).get(params) as { id: number }
      };
    } catch (err: any) {
      return { status: false, err: err.toString() };;
    }
  }

  async getAllPagesInfo(): Promise<DBResponse<PageInfo[]>> {
    const query = "select id, title, folder, saved, deleted from pages where deleted is null";

    try {
      return { status: true, res: await this.db.prepare(query).all() as PageInfo[] };
    } catch (err: any) {
      return { status: false, err: err.toString() };;
    }
  }

  async getAllTrashPagesInfo(): Promise<DBResponse<PageInfo[]>> {
    const query = "select id, title, folder, saved, deleted from pages where deleted is not null";

    try {
      return { status: true, res: await this.db.prepare(query).all() as PageInfo[] };
    } catch (err: any) {
      return { status: false, err: err.toString() };;
    }
  }

  async getPageData(id: number): Promise<DBResponse<StateData>> {
    const query = "select data from pages where id = :id";
    let params = { id };
    try {
      let res: any = await this.db.prepare(query).get(params);
      res.data = JSON.parse(res.data);
      return { status: true, res };
    } catch (err: any) {
      return { status: false, err: err.toString() };;
    }
  }

  async getPage(id: number): Promise<DBResponse<Page>> {
    const query = "select id, data, title, saved, deleted, folder from pages where id = :id and deleted is null";
    let params = { id };

    try {
      let res: any = await this.db.prepare(query).get(params);
      res.data = JSON.parse(res.data);
      
      return { status: true, res: res as Page };
    } catch (err: any) {
      return { status: false, err: err.toString() };;
    }
  }

  async savePage(page: Page): Promise<DBResponse<{saved: number}>> {
    const query = "update pages set data = :data, title = :title, saved = unixepoch() where id = :id returning saved";
    let params = { data: JSON.stringify(page.data), id: page.id, title: page.title };

    try {
      return { status: true, res: await this.db.prepare(query).get(params) as { saved: number } };
    } catch (err: any) {
      return { status: false, err: err.toString() };;
    }
  }

  async trashPage(id: number): Promise<DBResponse<RunResult>> {
    const query = "update pages set deleted = unixepoch() where id = :id";
    let params = { id };

    try {
      return {
        status: true, res: await this.db.prepare(query).run(params)
      };
    } catch (err: any) {
      return { status: false, err: err.toString() };;
    }
  }

  async restorePage(id: number): Promise<DBResponse<RunResult>> {
    const query = "update pages set deleted = null where id = :id";
    let params = { id };

    try {
      return {
        status: true, res: await this.db.prepare(query).run(params)
      };
    } catch (err: any) {
      return { status: false, err: err.toString() };;
    }
  }

  async deletePage(id: number): Promise<DBResponse<RunResult>> {
    const query = "delete from pages where id = :id";
    let params = { id };

    try {
      return {
        status: true, res: await this.db.prepare(query).run(params)
      };
    } catch (err: any) {
      return { status: false, err: err.toString() };;
    }
  }

  async getAllFolders(): Promise<DBResponse<Folder[]>> {
    const query = "select id, name from folders";

    try {
      return { status: true, res: await this.db.prepare(query).all() as Folder[] };
    } catch (err: any) {
      return { status: false, err: err.toString() };;
    }
  }

  async renameFolder(folder: Folder): Promise<DBResponse<RunResult>> {
    const query = "update folders set name = :name where id = :id";
    let params = { id: folder.id, name: folder.name };

    try {
      return { status: true, res: await this.db.prepare(query).run(params) };
    } catch (err: any) {
      return { status: false, err: err.toString() };;
    }
  }

  async createFolder(): Promise<DBResponse<{ id: number }>> {
    const query = "insert into folders(name) values (null) returning id";

    try {
      return {
        status: true, res: await this.db.prepare(query).get() as { id: number }
      };
    } catch (err: any) {
      return { status: false, err: err.toString() };;
    }
  }

  async deleteFolder(id: number): Promise<DBResponse<RunResult>> {
    const query = "delete from folders where id = :id"
    const params = { id }

    try {
      return { status: true, res: await this.db.prepare(query).run(params) };
    } catch (err: any) {
      return { status: false, err: err.toString() };;
    }
  }

  async changePageFolder(pageid: number, folderid: number | null): Promise<DBResponse<RunResult>> {
    const query = "update pages set folder = :folderid where id =:pageid"
    const params = { pageid, folderid }

    try {
      return { status: true, res: await this.db.prepare(query).run(params) };
    } catch (err: any) {
      return { status: false, err: err.toString() };;
    }
  }
}
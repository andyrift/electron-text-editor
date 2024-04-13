import { Database } from "better-sqlite3";

export type Response = {
  status: boolean;
  res?: any;
  err?: string;
}

export class Model {
  db: Database;
  constructor(db: Database) {
    this.db = db;
    this.db.prepare("create table if not exists table_1(id integer primary key, data)").run();
    this.db.prepare("create table if not exists pages(id integer primary key autoincrement, data not null, title text)").run();
  }

  async getAllPagesInfo(): Promise<Response> {
    const query = "select id, title from pages";

    try {
      return { status: true, res: await this.db.prepare(query).all() };
    } catch (err: any) {
      return { status: false, err: err.toString() };;
    }
  }

  async getPageData(id: number): Promise<Response> {
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

  async getPage(id: number): Promise<Response> {
    const query = "select data, title from pages where id = :id";
    let params = { id };

    try {
      let res: any = await this.db.prepare(query).get(params);
      res.data = JSON.parse(res.data);
      return { status: true, res };
    } catch (err: any) {
      return { status: false, err: err.toString() };;
    }
  }

  async savePage(page: any): Promise<Response> {
    const query = "insert into pages(id, data, title) values (:id, :data, :title) on conflict do update set data = :data, title = :title";
    let params = { data: JSON.stringify(page.data), id: page.id, title: page.title };

    try {
      return { status: true, res: await this.db.prepare(query).run(params) };
    } catch (err: any) {
      return { status: false, err: err.toString() };;
    }
  }

  async createPage(data: any): Promise<Response> {
    const query = "insert into pages(data, title) values (:data, :title) returning id";
    let params = { data: JSON.stringify(data), title: null };

    try {
      return {
        status: true, res: await this.db.prepare(query).get(params)
      };
    } catch (err: any) {
      return { status: false, err: err.toString() };;
    }
  }

  async deletePage(id: number): Promise<Response> {
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
}
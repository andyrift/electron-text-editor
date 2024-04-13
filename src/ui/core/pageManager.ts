export type Page = {
  id: number;
  data: any;
  title: string | null;
}

export type PageData = {
  id: number;
  data: any;
}

export type PageInfo = {
  id: number;
  title: string | null;
}

import { ref } from "vue";

export class PageManager {

  pages = ref<PageInfo[]>([]);
  currentPage = ref<PageInfo | null>(null);

  private static _instance: PageManager;

  static getInstance(): PageManager {
    if (PageManager._instance) return PageManager._instance;
    PageManager._instance = new PageManager();
    return PageManager._instance;
  };

  private constructor() {
    this.update();
  };

  update = async () => {
    let pages = await this.getAllPagesInfo()
    if (pages.length < 0) {
      pages.push({ id: 1, title: null })
      pages.push({ id: 2, title: "wa" })
      pages.push({ id: 2, title: "wawa" })
    }
    this.pages.value = pages;
  };

  getAllPagesInfo: () => Promise<PageInfo[]> = async () => {
    let ans = await window.api.getAllPagesInfo();

    if (ans.status) {
      let pages: PageInfo[] = [];
      ans.res.forEach((page: PageInfo) => {
        pages.push({ id: page.id, title: page.title });
      });
      return pages;
    }
    return [];
  };

  getPageData: (id: number) => Promise<PageData> = async (id) => {
    let ans = await window.api.getPageData(id);
    if (ans.status) {
      return { id, data: ans.res.data };
    }
    return { id, data: null };
  };

  getPage: (id: number) => Promise<Page> = async (id) => {
    let ans = await window.api.getPage(id);
    if (ans.status) {
      return { id, data: ans.res.data, title: ans.res.title };
    }
    return { id, data: null, title: null };
  };

  savePage: (page: Page) => Promise<boolean> = async (page) => {
    let ans = await window.api.savePage(page);
    if (ans.status) this.update();
    return ans.status;
  };

  createPage: (data: any) => Promise<number> = async (data) => {
    let ans = await window.api.createPage(data);
    if (ans.status) {
      this.update();
      return ans.res.id
    }
    return null
  };

  deletePage: (id: number) => Promise<boolean> = async (id) => {
    let ans = await window.api.deletePage(id);
    if (ans.status) this.update();
    return ans.status;
  };

};
import type { Folder, Page, PageData, PageInfo, StateData } from "@types";

import { ref } from "vue";
import { PubSub } from "./pubSub";

export class PageManager {

  pubSub = PubSub.getInstance();
  folders = ref<Folder[]>([]);
  pages = ref<PageInfo[]>([]);
  rootPages = ref<number[]>([]);
  pagesDict = ref(new Map<number, PageInfo>());
  foldersDict = ref(new Map<number, Folder>());
  currentPage = ref<PageInfo | null>(null);
  folderContents = ref<{ [id: number]: number[] }>({});

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
    let folders = await this.getAllFolders()
    this.pages.value = pages;
    this.rootPages.value = [];
    this.folders.value = folders;
    this.folderContents.value = {};
    folders.forEach(folder => {
      this.folderContents.value[folder.id] = [];
      this.foldersDict.value.set(folder.id, folder);
    })
    pages.forEach(page => {
      this.pagesDict.value.set(page.id, page);
      if (page.folder) {
        this.folderContents.value[page.folder].push(page.id)
      } else {
        this.rootPages.value.push(page.id)
      }
    })
  };

  getAllFolders: () => Promise<Folder[]> = async () => {
    let ans = await window.api.getAllFolders();

    if (ans.status && ans.res) {
      return ans.res;
    }
    return [];
  };

  async createFolder(): Promise<number | null> {
    let ans = await window.api.createFolder();
    if (ans.status && ans.res) {
      return ans.res.id
    }
    return null
  };

  async deleteFolder(id: number): Promise<boolean> {
    let ans = await window.api.deleteFolder(id);
    await this.update();
    return ans.status;
  };

  renameFolder: (id: number, newName: string | null) => Promise<boolean> = async (id, newName) => {
    let ans = await window.api.renameFolder({ id, name: newName });
    await this.update();
    return ans.status;
  };

  async changeFolder (pageid: number, folderid: number | null): Promise<boolean> {
    let ans = await window.api.changeFolder(pageid, folderid);
    await this.update();
    if (ans.status) {
      this.pubSub.emit('change-folder', folderid);
    }
    return ans.status;
  };

  getAllPagesInfo: () => Promise<PageInfo[]> = async () => {
    let ans = await window.api.getAllPagesInfo();

    if (ans.status && ans.res) {
      return ans.res;
    }
    return [];
  };

  getPageData: (id: number) => Promise<PageData | null> = async (id) => {
    let ans = await window.api.getPageData(id);
    if (ans.status && ans.res) {
      return { id, data: ans.res.data };
    }
    return null;
  };

  getPage: (id: number) => Promise<Page | null> = async (id) => {
    let ans = await window.api.getPage(id);
    if (ans.status && ans.res) {
      return { id, data: ans.res.data, title: ans.res.title, folder: ans.res.folder };
    }
    return null;
  };

  savePage: (page: Page) => Promise<boolean> = async (page) => {
    let ans = await window.api.savePage(page);
    if (ans.status) this.update();
    return ans.status;
  };

  createPage: (data: StateData) => Promise<number | null> = async (data) => {
    let ans = await window.api.createPage(data);
    if (ans.status && ans.res) {
      this.update();
      return ans.res.id
    }
    return null
  };

  deletePage: (id: number) => Promise<boolean> = async (id) => {
    this.pagesDict.value.delete(id);
    this.pagesDict.value
    let ans = await window.api.deletePage(id);
    if (ans.status) this.update();
    return ans.status;
  };

};
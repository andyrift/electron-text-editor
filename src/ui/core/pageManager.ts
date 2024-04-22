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
  deletedPages = ref<PageInfo[]>([]);

  private static _instance: PageManager;

  static getInstance(): PageManager {
    if (this._instance) return this._instance;
    this._instance = new this();
    return this._instance;
  };

  private constructor() {
    this.update();
  };

  async update() {
    let pages = await this.getAllPagesInfo()
    let delpages = await this.getAllTrashPagesInfo()
    let folders = await this.getAllFolders()
    delpages.sort((a, b) => { return (b.deleted || 0) - (a.deleted || 0)})
    this.pages.value = pages;
    this.deletedPages.value = delpages;
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
    delpages.forEach(page => {
      this.pagesDict.value.set(page.id, page);
    })
  };

  async getAllFolders(): Promise<Folder[]> {
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

  async renameFolder(id: number, newName: string | null): Promise<boolean> {
    let ans = await window.api.renameFolder({ id, name: newName });
    await this.update();
    return ans.status;
  };

  async changePageFolder (pageid: number, folderid: number | null): Promise<boolean> {
    let ans = await window.api.changePageFolder(pageid, folderid);
    await this.update();
    if (ans.status) {
      this.pubSub.emit('change-folder', folderid);
    }
    return ans.status;
  };

  async getAllPagesInfo(): Promise<PageInfo[]> {
    let ans = await window.api.getAllPagesInfo();

    if (ans.status && ans.res) {
      return ans.res;
    }
    return [];
  };

  async getAllTrashPagesInfo(): Promise<PageInfo[]> {
    let ans = await window.api.getAllTrashPagesInfo();

    if (ans.status && ans.res) {
      return ans.res;
    }
    return [];
  };

  async getPageData(id: number): Promise<PageData | null> {
    let ans = await window.api.getPageData(id);
    if (ans.status && ans.res) {
      return { id, data: ans.res.data };
    }
    return null;
  };

  async getPage(id: number): Promise<Page | null> {
    let ans = await window.api.getPage(id);
    if (ans.status && ans.res) {
      return { id, ...ans.res };
    }
    return null;
  };

  async savePage(page: Page): Promise<{ saved: number } | null> {
    let ans = await window.api.savePage(page);
    if (ans.status) {
      this.update();
      return ans.res
    }
    return null;
  };

  async createPage(data: StateData): Promise<number | null> {
    let ans = await window.api.createPage(data);
    if (ans.status && ans.res) {
      this.update();
      return ans.res.id
    }
    return null
  };

  async trashPage(id: number): Promise<boolean> {
    this.pagesDict.value.delete(id);
    let ans = await window.api.trashPage(id);
    if (ans.status) this.update();
    return ans.status;
  };

  async restorePage(id: number): Promise<boolean> {
    let ans = await window.api.restorePage(id);
    if (ans.status) this.update();
    return ans.status;
  };

  async deletePage(id: number): Promise<boolean> {
    this.pagesDict.value.delete(id);
    let ans = await window.api.deletePage(id);
    if (ans.status) this.update();
    return ans.status;
  };

};
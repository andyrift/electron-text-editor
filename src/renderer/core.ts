import { Settings, settings } from "../settings";

import { PageManager } from "./state-manager/pageManager";
import { Editor } from "../editor"
import { Page } from "@types";

export class Core {
  private pageManager: PageManager;
  private editor: Editor;
  settings: Settings;

  private static _instance: Core;

  static getInstance() : Core {
    if (this._instance) return this._instance;
    this._instance = new this();
    return this._instance;
  };

  private constructor() {
    if (Core._instance) {
      throw new Error("Can not create more instances of Manager");
    }

    if (!window.settings) {
      window.settings = settings;
    }

    this.pageManager = PageManager.getInstance();
    this.editor = Editor.getInstance();
    
    this.settings = new Settings(window.settings);

    this.editor.subscribeToUseView(async () => {
      await this.pageManager.update()
      let pages = await this.pageManager.getAllPagesInfo();
      let id = null;
      if (pages.length) id = pages[0].id
      else id = await this.pageManager.createPage(this.editor.emptyPage());
      if (id) await this.openPage(id, false);
    })
  }

  async newPageOpen(): Promise<boolean> {
    let id = await this.pageManager.createPage(this.editor.emptyPage());
    if (id) return this.openPage(id);
    return false;
  }

  async openPage(id: number, save: boolean = true): Promise<boolean> {
    if (save) await this.saveCurrentPage()
    let page = await this.pageManager.getPage(id);
    if (!page) return false
    this.pageManager.currentPage.value = page;
    this.editor.putPage(page.data);
    return true;
  }

  async saveCurrentPage(): Promise<boolean> {
    if (!this.pageManager.currentPage.value) return false;
    let pageEditor = this.editor.getPage();
    if (!pageEditor) return false;
    let page: Page = {
      id: this.pageManager.currentPage.value.id,
      data: pageEditor.data,
      title: pageEditor.title,
      saved: this.pageManager.currentPage.value.saved, 
      deleted: this.pageManager.currentPage.value.deleted, 
      folder: this.pageManager.currentPage.value.folder,      
    }
    
    let ans = await this.pageManager.savePage(page)
    if (ans) {
      this.pageManager.currentPage.value.title = page.title;
      this.pageManager.currentPage.value.saved = ans.saved;
      return true;
    }
    return false
  }

  async deleteCurrentPage(): Promise<boolean> {
    if (this.pageManager.currentPage.value) return this.trashPage(this.pageManager.currentPage.value.id);
    return false;
  }

  async trashPage(id: number): Promise<boolean> {
    if (this.pageManager.currentPage.value && this.pageManager.currentPage.value.id == id) {
      let openid = null;
      if (this.pageManager.pages.value.length > 1) {
        openid = this.pageManager.pages.value.find(page => page.id != id)?.id;
      }
      if (!openid) openid = await this.pageManager.createPage(await this.editor.emptyPage());
      if (openid) {
        await this.openPage(openid);
        return this.pageManager.trashPage(id);
      }
      return false;
    } else return this.pageManager.trashPage(id);
  }

  async restorePageAndSwitch(id: number): Promise<boolean> {
    let res = await this.pageManager.restorePage(id);
    if (!res) return false
    return this.openPage(id);
  }

  async changeToNewFolder(pageid: number): Promise<boolean> {
    let folderid = await this.pageManager.createFolder();
    if (folderid) return this.pageManager.changePageFolder(pageid, folderid);
    return false
  }
}
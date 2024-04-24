import { Folder, Page, StateData } from "@types";
import { Model } from "./dbModel";

export default (model: Model): { [id: string]: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any }=> { 
  return {
    'createPage': async (_event, data: StateData) => {
      return await model.createPage(data);
    },
    'getAllPagesInfo': async (_event) => {
      return await model.getAllPagesInfo();
    },
    'getAllTrashPagesInfo': async (_event) => {
      return await model.getAllTrashPagesInfo();
    },
    'getPage': async (_event, id: number) => {
      return await model.getPage(id);
    },
    'getPageData': async (_event, id: number) => {
      return await model.getPageData(id);
    },
    'savePage': async (_event, page: Page) => {
      return await model.savePage(page);
    },
    'trashPage': async (_event, id: number) => {
      return await model.trashPage(id);
    },
    'restorePage': async (_event, id: number) => {
      return await model.restorePage(id);
    },
    'deletePage': async (_event, id: number) => {
      return await model.deletePage(id);
    },

    'getAllFolders': async (_event) => {
      return await model.getAllFolders();
    },
    'deleteFolder': async (_event, id: number) => {
      return await model.deleteFolder(id);
    },
    'createFolder': async (_event) => {
      return await model.createFolder();
    },
    'renameFolder': async (_event, folder: Folder) => {
      return await model.renameFolder(folder);
    },
    'changePageFolder': async (_event, pageid: number, folderid: number | null) => {
      return await model.changePageFolder(pageid, folderid);
    },

    'run': async (_event, query: string) => {
      return await model.run(query);
    },
    'get': async (_event, query: string) => {
      return await model.get(query);
    },
    'all': async (_event, query: string) => {
      return await model.all(query);
    },
  }
}
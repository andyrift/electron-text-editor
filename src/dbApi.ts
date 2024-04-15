import { Folder, Page, StateData } from "@types";
import { Model } from "./dbModel";

export default (model: Model): { [id: string]: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any }=> { 
  return {
    'db:getAllFolders': async (_event) => {
      return await model.getAllFolders();
    },
    'db:deleteFolder': async (_event, id: number) => {
      return await model.deleteFolder(id);
    },
    'db:createFolder': async (_event) => {
      return await model.createFolder();
    },
    'db:renameFolder': async (_event, folder: Folder) => {
      return await model.renameFolder(folder);
    },
    'db:changeFolder': async (_event, pageid: number, folderid: number | null) => {
      return await model.changeFolder(pageid, folderid);
    },
    'db:getAllPagesInfo': async (_event) => {
      return await model.getAllPagesInfo();
    },
    'db:createPage': async (_event, data: StateData) => {
      return await model.createPage(data);
    },
    'db:deletePage': async (_event, id: number) => {
      return await model.deletePage(id);
    },
    'db:getPage': async (_event, id: number) => {
      return await model.getPage(id);
    },
    'db:getPageData': async (_event, id: number) => {
      return await model.getPageData(id);
    },
    'db:savePage': async (_event, page: Page) => {
      return await model.savePage(page);
    },
    'db:run': async (_event, query: string) => {
      return await model.run(query);
    },
    'db:get': async (_event, query: string) => {
      return await model.get(query);
    },
    'db:all': async (_event, query: string) => {
      return await model.all(query);
    },
  }
}
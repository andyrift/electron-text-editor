import { Model } from "./dbModel";

export default (model: Model): { [id: string]: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any }=> { 
  return {
    'db:getAllPagesInfo': async (_event) => {
      return await model.getAllPagesInfo();
    },
    'db:createPage': async (_event, data: any) => {
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
    'db:savePage': async (_event, page: any) => {
      return await model.savePage(page);
    }
  }
}
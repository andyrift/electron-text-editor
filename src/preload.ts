import { contextBridge, ipcRenderer } from 'electron'

export type Response = {
  status: boolean;
  res?: any;
  err?: string;
}

contextBridge.exposeInMainWorld('api', {
  logMessage: (message: any) => ipcRenderer.send('log-message', message),
  hashMessage: (message: any) => ipcRenderer.invoke('hash-message', message),
  dbquery_run: (query: string, arg: any) => ipcRenderer.invoke('dbquery_run', query, arg),
  dbquery_get: (query: string, arg: any) => ipcRenderer.invoke('dbquery_get', query, arg),
  dbquery_all: (query: string, arg: any) => ipcRenderer.invoke('dbquery_all', query, arg),
  getAllPagesInfo: (): Promise<Response> => ipcRenderer.invoke('db:getAllPagesInfo'),
  createPage: (data: any): Promise<Response> => ipcRenderer.invoke('db:createPage', data),
  deletePage: (id: number): Promise<Response> => ipcRenderer.invoke('db:deletePage', id),
  getPage: (id: number): Promise<Response> => ipcRenderer.invoke('db:getPage', id),
  getPageData: (id: number): Promise<Response> => ipcRenderer.invoke('db:getPageData', id),
  savePage: (page: any): Promise<Response> => ipcRenderer.invoke('db:savePage', page),
})
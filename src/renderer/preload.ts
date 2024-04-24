import { DBResponse, Folder, Page, PageInfo, StateData } from '@types';
import { RunResult } from 'better-sqlite3';
import { contextBridge, ipcRenderer } from 'electron'

let api : {[id: string] : any} = {
  logMessage: (message: any) => ipcRenderer.send('log-message', message),
  hashMessage: (message: any) => ipcRenderer.invoke('hash-message', message),
  
  dbquery_run: (query: string) => ipcRenderer.invoke('db:run', query),
  dbquery_get: (query: string) => ipcRenderer.invoke('db:get', query),
  dbquery_all: (query: string) => ipcRenderer.invoke('db:all', query),
  
  createPage: (data: StateData): Promise<DBResponse<{ id: number }>> => ipcRenderer.invoke('db:createPage', data),
  getAllPagesInfo: (): Promise<DBResponse<PageInfo[]>> => ipcRenderer.invoke('db:getAllPagesInfo'),
  getAllTrashPagesInfo: (): Promise<DBResponse<PageInfo[]>> => ipcRenderer.invoke('db:getAllTrashPagesInfo'),
  getPageData: (id: number): Promise<DBResponse<StateData>> => ipcRenderer.invoke('db:getPageData', id),
  getPage: (id: number): Promise<DBResponse<Page>> => ipcRenderer.invoke('db:getPage', id),
  savePage: (page: Page): Promise<DBResponse<{ saved: number }>> => ipcRenderer.invoke('db:savePage', page),
  trashPage: (id: number): Promise<DBResponse<RunResult>> => ipcRenderer.invoke('db:trashPage', id),
  restorePage: (id: number): Promise<DBResponse<RunResult>> => ipcRenderer.invoke('db:restorePage', id),
  deletePage: (id: number): Promise<DBResponse<RunResult>> => ipcRenderer.invoke('db:deletePage', id),

  getAllFolders: (): Promise<DBResponse<Folder[]>> => ipcRenderer.invoke('db:getAllFolders'),
  createFolder: (): Promise<DBResponse<{ id: number }>> => ipcRenderer.invoke('db:createFolder'),
  deleteFolder: (id: number): Promise<DBResponse<RunResult>> => ipcRenderer.invoke('db:deleteFolder', id),
  renameFolder: (folder: Folder): Promise<DBResponse<RunResult>> => ipcRenderer.invoke('db:renameFolder', folder),
  changePageFolder: (pageid: number, folderid: number | null): Promise<DBResponse<RunResult>> => ipcRenderer.invoke('db:changePageFolder', pageid, folderid),
}

declare global {
  interface Window {
    api: typeof api,
    settings: any;
  }
}

contextBridge.exposeInMainWorld('api', api)
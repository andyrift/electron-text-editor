import { DBResponse, Folder, Page, PageInfo, StateData } from '@types';
import { RunResult } from 'better-sqlite3';
import { contextBridge, ipcRenderer } from 'electron'

const api = {
  logMessage: (message: any) => ipcRenderer.send('log-message', message),
  hashMessage: (message: any) => ipcRenderer.invoke('hash-message', message),
  dbquery_run: (query: string) => ipcRenderer.invoke('db:run', query),
  dbquery_get: (query: string) => ipcRenderer.invoke('db:get', query),
  dbquery_all: (query: string) => ipcRenderer.invoke('db:all', query),
  getAllFolders: (): Promise<DBResponse<Folder[]>> => ipcRenderer.invoke('db:getAllFolders'),
  createFolder: (): Promise<DBResponse<{ id: number }>> => ipcRenderer.invoke('db:createFolder'),
  deleteFolder: (id: number): Promise<DBResponse<RunResult>> => ipcRenderer.invoke('db:deleteFolder', id),
  renameFolder: (folder: Folder): Promise<DBResponse<RunResult>> => ipcRenderer.invoke('db:renameFolder', folder),
  changeFolder: (pageid: number, folderid: number | null): Promise<DBResponse<RunResult>> => ipcRenderer.invoke('db:changeFolder', pageid, folderid),
  getAllPagesInfo: (): Promise<DBResponse<PageInfo[]>> => ipcRenderer.invoke('db:getAllPagesInfo'),
  getPageData: (id: number): Promise<DBResponse<StateData>> => ipcRenderer.invoke('db:getPageData', id),
  getPage: (id: number): Promise<DBResponse<Page>> => ipcRenderer.invoke('db:getPage', id),
  savePage: (page: Page): Promise<DBResponse<RunResult>> => ipcRenderer.invoke('db:savePage', page),
  createPage: (data: StateData): Promise<DBResponse<{ id: number }>> => ipcRenderer.invoke('db:createPage', data),
  deletePage: (id: number): Promise<DBResponse<RunResult>> => ipcRenderer.invoke('db:deletePage', id),
}

declare global {
  interface Window {
    api: typeof api,
    settings: any;
  }
}

contextBridge.exposeInMainWorld('api', api)
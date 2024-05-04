import { TypedIpcMain, TypedIpcRenderer } from "./typesafeIPC"

import { BrowserWindow, ipcMain, ipcRenderer } from "electron"

import { DBModel } from "@src/database/model"

type Events = {
  "toggle-dev-tools": () => void
}

type Methods = typeof DBModel.prototype.methods

type MainCommandsDB = {
  [Key in keyof Methods as `db:${Key}`]: Methods[Key]
}

export type RendererCommandsDB = {
  [Key in keyof Methods as `db:${Key}`]: (...args: Parameters<Methods[Key]>) => Awaited<ReturnType<Methods[Key]>>
}

type MainCommands = {
  
} & MainCommandsDB

type RendererCommands = {
  
} & RendererCommandsDB

const typedIpcMain = ipcMain as TypedIpcMain<Events, MainCommands>
export const typedIpcRenderer = ipcRenderer as TypedIpcRenderer<Events, RendererCommands>

export async function initIPCMain(model: DBModel) {
  for (let key in model.methods) {
    const method = model.methods[key as keyof Methods]
    const channel = "db:" + key
    typedIpcMain.handle(channel as keyof MainCommandsDB, async (_, ...args) => {
      return await (method as any).apply(model, args)
    })
  }
}

export async function initIPCMainLate(mainWindow: BrowserWindow) {
  typedIpcMain.on("toggle-dev-tools", (_) => {
    if(mainWindow.webContents.isDevToolsOpened())
      mainWindow.webContents.closeDevTools()
    else mainWindow.webContents.openDevTools({ mode: 'undocked' })
  })
}
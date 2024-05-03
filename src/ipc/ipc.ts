import { TypedIpcMain, TypedIpcRenderer } from "./typesafeIPC"

import { ipcMain, ipcRenderer } from "electron"

import { DBModel } from "@src/database/model"

type Events = {}

type Methods = typeof DBModel.prototype.methods

type Commands = {
  [Key in keyof Methods as `db:${Key}`]: Methods[Key]
}

export type RendererCommands = {
  [Key in keyof Methods as `db:${Key}`]: (...args: Parameters<Methods[Key]>) => Awaited<ReturnType<Methods[Key]>>
}

const typedIpcMain = ipcMain as TypedIpcMain<Events, Commands>
export const typedIpcRenderer = ipcRenderer as TypedIpcRenderer<Events, RendererCommands>

export async function initIPCMain(model: DBModel) {

  for (let key in model.methods) {
    const method = model.methods[key as keyof Methods]
    type P = Parameters<typeof method>
    const channel = "db:" + key
    typedIpcMain.handle(channel as keyof Commands, async (_, ...args: P) => {
      console.log(...args)
      return await (method as any).apply(model, args)
    })
  }
}
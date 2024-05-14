import { Folder, Page } from "@src/database/model"
import { PubSub } from "@src/pubSub"

import type { IWorkspaceStructure, StructureHierarchy } from "./workspaceStructure"

export interface IWorkspaceManager {
  getPageMap(): Map<number, Page>
  getFolderMap(): Map<number, Folder>
  getPageIDs(): number[]
  getPageIDsSorted(): number[]
  getStructure(): StructureHierarchy
}

export class WorkspaceManager implements IWorkspaceManager {

  pubSub = PubSub.getInstance()

  queue: (() => Promise<void> | void)[] = []
  executing = false

  workspaceStructure: IWorkspaceStructure

  constructor(workspaceStructure: IWorkspaceStructure) {

    this.workspaceStructure = workspaceStructure

    this.pubSub.subscribe("change-page-folder", async (child: number, parent: number | null) => {
      const res = await window.invoke("db:changePageFolder", child, parent)
      if (res.status) this.pubSub.emit("page-moved", child)
    })

    this.pubSub.subscribe("change-folder-folder", async (child: number, parent: number | null) => {
      const res = await window.invoke("db:changeFolderFolder", child, parent)
      if (res.status) this.pubSub.emit("folder-moved", child)
    })

    this.pubSub.subscribe("change-folder-name", async (id: number, name: string | null) => {
      const res = await window.invoke("db:renameFolder", id, name)
      if (res.status) this.pubSub.emit("folder-saved", id)
    })

    this.pubSub.subscribe("browser-create-folder", async () => {
      const res = await window.invoke("db:createFolder")
      if (res.status) this.pubSub.emit("folder-created", res.value.id)
    })

    this.pubSub.subscribe("browser-delete-folder", async (id: number) => {
      const res = await window.invoke("db:deleteFolder", id)
      if (res.status) this.pubSub.emit("folder-deleted", id)
    })

    this.addToQueue(this.init)
  }

  async init() {

  }

  addToQueue(foo: typeof this.queue[number]) {
    this.queue.unshift(foo)
    this.executeQueue()
  }

  async executeQueue() {
    if (this.executing) return
    while (true) {
      const foo = this.queue.pop()
      if (!foo) break
      await foo()
    }
    this.executing = false
  }

  getPageIDs(): number[] {
    return this.workspaceStructure.getPageIDs()
  }

  getPageIDsSorted(): number[] {
    return this.workspaceStructure.getPageIDsSorted()
  }

  getStructure(): StructureHierarchy {
    return this.workspaceStructure.getStructure()
  }

  getPageMap(): Map<number, Page> {
    return this.workspaceStructure.getPageMap()
  }

  getFolderMap(): Map<number, Folder> {
    return this.workspaceStructure.getFolderMap()
  }

}
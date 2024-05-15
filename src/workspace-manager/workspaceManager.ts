import { Folder, Page } from "@src/database/model"
import { PubSub } from "@src/pubSub"

import { WorkspaceStructure, type IWorkspaceStructure, type StructureHierarchy } from "./workspaceStructure"
import { IStateManager, StateManager } from "@src/state-manager/stateManager"

export interface IWorkspaceManager {
  getPageMap(): Map<number, Page>
  getFolderMap(): Map<number, Folder>
  getPageIDs(): number[]
  getPageIDsSorted(): number[]
  getStructure(): StructureHierarchy
  getCurrentPageId(): number | null
}

export class WorkspaceManager implements IWorkspaceManager {

  pubSub = PubSub.getInstance()

  queue: (() => Promise<void> | void)[] = []
  executing = false

  workspaceStructure: IWorkspaceStructure

  stateManager: IStateManager

  private static _instance: IWorkspaceManager

  static getInstance(): IWorkspaceManager {
    if (this._instance) return this._instance
    this._instance = new this()
    return this._instance
  };

  private constructor() {

    const workspaceStructure: IWorkspaceStructure = new WorkspaceStructure()
    this.workspaceStructure = workspaceStructure

    const stateManager: IStateManager = new StateManager()
    this.stateManager = stateManager

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
    this.pubSub.subscribe("workspace-structure-init-end", () => {
      console.log("workspace-structure-init-end")
    })
    this.pubSub.subscribe("state-manager-init-end", () => {
      console.log("state-manager-init-end")
    })
    this.pubSub.subscribe("workspace-manager-init-end", () => {
      console.log("workspace-manager-init-end")
    })

    await this.workspaceStructure.start()
    const ids = this.getPageIDs()
    if (ids.length > 0) {
      this.stateManager.switchToPage(ids[0]!)
    } else {
      const id = await this.stateManager.createAndSavePage()
      if (id === null) {
        throw "Could not create and open page"
      } else {
        this.pubSub.emit("page-created", id)
        this.stateManager.switchToPage(id)
      }
    }
    await this.stateManager.start()

    this.pubSub.subscribe("save-current-page", async () => {
      if (await this.stateManager.saveCurrentPage()) {
        this.pubSub.emit("page-saved", this.stateManager.getCurrent())
      }
    })
    
    this.pubSub.emit("workspace-manager-init-end")
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
      await foo.call(this)
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

  getCurrentPageId(): number | null {
    return this.stateManager.getCurrent()
  }

}
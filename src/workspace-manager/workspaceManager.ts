import { Folder, Page } from "@src/database/model"
import { PubSub } from "@src/pubSub"

import { WorkspaceStructure, type IWorkspaceStructure, type StructureHierarchy } from "./workspaceStructure"
import { IStateManager, StateManager } from "@src/state-manager/stateManager"

export interface IWorkspaceManager {
  getPageMap(): Map<number, Page>
  getFolderMap(): Map<number, Folder>
  getPageTrashMap(): Map<number, Page>
  getPageIDs(): number[]
  getPageIDsSorted(): number[]
  getStructure(): StructureHierarchy
  getCurrentPageId(): number | null
  getTrashStructure(): number[]
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

    this.pubSub.subscribe("trash-delete-page", async (id: number) => {
      const res = await window.invoke("db:deletePage", id)
      if (res.status) this.pubSub.emit("page-deleted", id)
    })

    this.pubSub.subscribe("trash-restore-page", async (id: number) => {
      const res = await window.invoke("db:restorePage", id)
      await this.stateManager.switchToPage(id)
      if (res.status) this.pubSub.emit("page-restored", id)
    })

    this.addToQueue(this.init)
  }

  async init() {
    await this.workspaceStructure.start()
    const ids = this.getPageIDsSorted()
    if (ids.length > 0) {
      this.stateManager.switchToPage(ids[0]!)
    } else {
      await this.createAndOpenPage()
    }
    await this.stateManager.start()

    this.pubSub.subscribe("save-current-page", async () => {
      await this.stateManager.saveCurrentPage()
    })

    this.pubSub.subscribe("browser-create-page", () => {
      this.createAndOpenPage()
    })

    this.pubSub.subscribe("browser-delete-page", async (id: number) => {
      const page = this.getPageMap().get(id)
      if (!page) return
      if (id == this.getCurrentPageId()) {
        await this.stateManager.saveCurrentPage()
        if (this.getPageIDs().length > 1) {
          if (!await this.stateManager.switchToPage(this.getPageIDs().find(a => a != id)!))
            return
        } else {
          await this.createAndOpenPage()
        }
      }
      this.trashPage(id)
    })

    this.pubSub.subscribe("browser-open-page", (id: number) => {
      this.stateManager.switchToPage(id)
    })
    
    this.pubSub.emit("workspace-manager-init-end")
  }

  private async createAndOpenPage() {
    const id = await this.stateManager.createAndSavePage()
    if (id === null) {
      throw "Could not create and open page"
    } else {
      this.pubSub.emit("page-created", id)
      this.stateManager.switchToPage(id)
    }
  }

  private async trashPage(id: number) {
    const res = await window.invoke("db:trashPage", id)
    if (res.status) this.pubSub.emit("page-trashed", id)
    else console.error(res.value)
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

  getTrashStructure(): number[] {
    return this.workspaceStructure.getTrashStructure()
  }

  getPageMap(): Map<number, Page> {
    return this.workspaceStructure.getPageMap()
  }

  getFolderMap(): Map<number, Folder> {
    return this.workspaceStructure.getFolderMap()
  }

  getPageTrashMap(): Map<number, Page> {
    return this.workspaceStructure.getPageTrashMap()
  }

  getCurrentPageId(): number | null {
    return this.stateManager.getCurrent()
  }

}
import { Folder, Page } from "@src/database/model"
import { PubSub } from "@src/pubSub"

export type StructurePage = {
  id: number
}

export type StructureFolder = {
  id: number
  content: Array<StructurePage | StructureFolder>
}

export type StructureHierarchy = Array<StructurePage | StructureFolder>

export class WorkspaceStructure {

  pages = new Map<number, Page>()
  pages_trash = new Map<number, Page>()
  folders = new Map<number, Folder>()

  structure: StructureHierarchy = []

  pubSub = PubSub.getInstance()

  queue: (() => Promise<void> | void)[] = []
  executing = false
  recalculate = false

  constructor() {
    this.addToQueue(this.init)

    this.pubSub.subscribe("page-saved", (id: number) => {
      this.addToQueue(async () => {
        await this.pageSaved(id)
      })
    })

    this.pubSub.subscribe("page-moved", (id: number) => {
      this.addToQueue(async () => {
        await this.pageMoved(id)
      })
    })

    this.pubSub.subscribe("page-trashed", (id: number) => {
      this.addToQueue(async () => {
        await this.pageTrashed(id)
      })
    })

    this.pubSub.subscribe("page-restored", (id: number) => {
      this.addToQueue(async () => {
        await this.pageRestored(id)
      })
    })

    this.pubSub.subscribe("page-deleted", (id: number) => {
      this.addToQueue(async () => {
        await this.pageDeleted(id)
      })
    })

    this.pubSub.subscribe("folder-created", (id: number) => {
      this.addToQueue(async () => {
        await this.folderCreated(id)
      })
    })

    this.pubSub.subscribe("folder-saved", (id: number) => {
      this.addToQueue(async () => {
        await this.folderSaved(id)
      })
    })

    this.pubSub.subscribe("folder-deleted", (id: number) => {
      this.addToQueue(async () => {
        await this.folderDeleted(id)
      })
    })

    this.pubSub.subscribe("folder-moved", (id: number) => {
      this.addToQueue(async () => {
        await this.folderMoved(id)
      })
    })

    this.pubSub.subscribe("workspace-structure-update", (id: number) => {
      this.addToQueue(async () => {
        await this.update()
      })
    })
  }

  async init() {
    const pages = await window.invoke("db:getAllPages", false)
    const folders = await window.invoke("db:getAllFolders")

    if (!pages.status) return
    if (!folders.status) return

    pages.value.forEach(page => {
      this.pages.set(page.id, page)
    })
    folders.value.forEach(folder => {
      this.folders.set(folder.id, folder)
    })

    this.recalculateStructure(false)

    this.pubSub.emit("workspace-structure-init-end", this.structure)
  }

  async update() {
    const pages = await window.invoke("db:getAllPages", false)
    const folders = await window.invoke("db:getAllFolders")

    if (!pages.status) return
    if (!folders.status) return

    this.pages.clear()
    this.folders.clear()

    pages.value.forEach(page => {
      this.pages.set(page.id, page)
    })
    folders.value.forEach(folder => {
      this.folders.set(folder.id, folder)
    })

    this.recalculateStructure(true)
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
    if (this.recalculate) {
      this.recalculateStructure(true)
      this.recalculate = false
    }
    this.executing = false
  }

  private calculateContent(folderid: number | null) {
    const str: StructureHierarchy = []
    this.pages.forEach(page => {
      if (page.folder == folderid) str.push({ 
        id: page.id 
      })
    })
    this.folders.forEach(folder => {
      if (folder.folder == folderid) str.push({ 
        id: folder.id, 
        content: this.calculateContent(folder.id) 
      })
    })
    return str
  }

  recalculateStructure(emit: boolean) {
    this.structure = this.calculateContent(null)
    if(emit) this.pubSub.emit("workspace-structure-changed", this.structure)
  }

  async pageSaved(id: number) {
    const page = await window.invoke("db:getPage", id)
    if (!page.status) return
    if (page.value) this.pages.set(id, page.value)
    else this.pages.delete(id)
    this.pubSub.emit("workspace-pages-changed")
  }

  async pageMoved(id: number) {
    const page = await window.invoke("db:getPage", id)
    if (!page.status) throw "Page not found, could not update structure"
    if (page.value) this.pages.set(id, page.value)
    else this.pages.delete(id)
    this.recalculate = true
  }

  async pageTrashed(id: number) {
    this.pages.delete(id)
    this.recalculate = true
  }

  async pageRestored(id: number) {
    const page = await window.invoke("db:getPage", id)
    if (!page.status) return
    if (page.value) this.pages.set(id, page.value)
    else this.pages.delete(id)
    this.recalculate = true
  }

  async pageDeleted(id: number) {
    this.pages.delete(id)
    this.recalculate = true
  }

  async folderCreated(id: number) {
    const folder = await window.invoke("db:getFolder", id)
    if (!folder.status) throw "Could not acquire created folder"
    if (folder.value) this.folders.set(id, folder.value)
    else throw "Created folder does not exist"
    this.recalculate = true
  }

  async folderSaved(id: number) {
    const folder = await window.invoke("db:getFolder", id)
    if (!folder.status) return
    if (folder.value) this.folders.set(id, folder.value)
    else this.folders.delete(id)
    this.pubSub.emit("workspace-folders-changed")
  }

  async folderMoved(id: number) {
    const folder = await window.invoke("db:getFolder", id)
    if (!folder.status) throw "Folder not found, could not update structure"
    if (folder.value) this.folders.set(id, folder.value)
    else this.folders.delete(id)
    this.recalculate = true
  }

  async folderDeleted(id: number) {
    this.folders.delete(id)
    this.folders.forEach(item => {
      if (item.folder == id) item.folder = null
    })
    this.pages.forEach(item => {
      if (item.folder == id) item.folder = null
    })
    this.recalculate = true
  }
}
import { Folder, Page } from "@src/database/model"
import { PubSub } from "@src/pubSub"

type StructureFolder = {
  id: number
  pages: number[]
}

export class WorkspaceStructure {

  pages = new Map<number, Page>()
  pages_trash = new Map<number, Page>()
  folders = new Map<number, Folder>()

  structure: Array<StructureFolder | number> = []

  pubSub = PubSub.getInstance()

  queue: (() => Promise<void> | void)[] = []
  executing = false
  recalculate = false

  constructor() {
    this.addToQueue(this.init)

    this.pubSub.subscribe("page-saved", (id: number) => {
      this.addToQueue(() => {
        this.pageSaved(id)
      })
    })

    this.pubSub.subscribe("page-moved", (id: number) => {
      this.addToQueue(() => {
        this.pageMoved(id)
      })
    })

    this.pubSub.subscribe("page-trashed", (id: number) => {
      this.addToQueue(() => {
        this.pageTrashed(id)
      })
    })

    this.pubSub.subscribe("page-restored", (id: number) => {
      this.addToQueue(() => {
        this.pageRestored(id)
      })
    })

    this.pubSub.subscribe("page-deleted", (id: number) => {
      this.addToQueue(() => {
        this.pageDeleted(id)
      })
    })

    this.pubSub.subscribe("folder-created", (id: number) => {
      this.addToQueue(() => {
        this.folderCreated(id)
      })
    })

    this.pubSub.subscribe("folder-saved", (id: number) => {
      this.addToQueue(() => {
        this.folderSaved(id)
      })
    })

    this.pubSub.subscribe("folder-deleted", (id: number) => {
      this.addToQueue(() => {
        this.folderDeleted(id)
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

    this.recalculateStructure()

    this.pubSub.emit("workspace-structure-init-end")
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
    if (this.recalculate) {
      this.recalculateStructure()
      this.recalculate = false
    }
    this.executing = false
  }

  recalculateStructure() {
    this.structure = []
    this.pages.forEach(page => {
      if (!page.folder) this.structure.push(page.id)
    })
    this.folders.forEach(folder => {
      const pages: number[] = []
      this.pages.forEach(page => {
        if (page.folder === folder.id) pages.push(page.id)
      })
      this.structure.push({
        id: folder.id,
        pages
      })
    })
    this.pubSub.emit("workspace-structure-changed")
  }

  async pageSaved(id: number) {
    const page = await window.invoke("db:getPage", id)
    if (!page.status) return
    if (page.value) this.pages.set(id, page.value)
    else this.pages.delete(id)
  }

  async pageMoved(id: number) {
    const page = await window.invoke("db:getPage", id)
    if (!page.status) return
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
    if (!folder.status) return
    if (folder.value) this.folders.set(id, folder.value)
    else this.folders.delete(id)
    this.recalculate = true
  }

  async folderSaved(id: number) {
    const folder = await window.invoke("db:getFolder", id)
    if (!folder.status) return
    if (folder.value) this.folders.set(id, folder.value)
    else this.folders.delete(id)
  }

  async folderDeleted(id: number) {
    this.folders.delete(id)
    this.recalculate = true
  }
}
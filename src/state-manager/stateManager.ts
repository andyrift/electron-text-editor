import { DocumentJson, EditorStateJson, PageData } from "@src/database/model";
import { Editor } from "@src/editor";
import { PubSub } from "@src/pubSub";

export interface IStateManager {
  switchToPage(id: number): boolean
  getCurrent(): number | null
  start(): Promise<void>
  createAndSavePage(): Promise<number | null>
  saveCurrentPage(): Promise<boolean>
}

export class StateManager implements IStateManager {

  pubSub: PubSub
  editor: Editor

  private current: number | null = null

  constructor() {
    this.pubSub = PubSub.getInstance()
    this.pubSub.subscribe('use-editor', () => {
      this.init()
    })
    this.editor = Editor.getInstance()
  }

  private async init() {

    // here editor already has view
    if (!this.editor.hasView()) throw "No editor view on StateManager init()"

    this.pubSub.emit("state-manager-init-end")
  }

  async start() {
    if (!this.editor.hasView())
      await new Promise((resolve, reject) => { this.pubSub.subscribe("state-manager-init-end", resolve) })
    if (this.current !== null)
      if (await this.openPageInEditor(this.current))
        this.editor.setEditable(true)
      else console.error("Could not open page")
  }

  private async openPageInEditor(id: number): Promise<boolean> {
    let res = await window.invoke("db:getPageData", id)
    if (!res.status) {
      console.error(res.value)
      return false
    }

    this.current = res.value.id
    this.editor.putPage(res.value.document, res.value.editor_state)
    return true
  }

  getCurrentPageData(): PageData | null {
    if (this.current === null) return null

    const editorPage = this.editor.getPageData()
    if (!editorPage) return null

    const pageData: PageData = {
      id: this.current,
      document: editorPage.document,
      editor_state: editorPage.editor_state,
    }

    return pageData
  }

  switchToPage(id: number): boolean {
    if (this.current === null) {
      this.current = id
      return true
    }
    return false
  }

  getCurrent(): number | null {
    return this.current
  }

  async createAndSavePage(): Promise<number | null> {
    const pageData = this.editor.newPageData()
    const res = await window.invoke("db:createPage", pageData.document, pageData.editor_state)
    if (res.status) {
      return res.value.id
    } else {
      return null
    }
  }

  async saveCurrentPage(): Promise<boolean> {
    if (this.current) {
      const title = this.editor.getTitle()
      const pageData = this.editor.getPageData()
      if (pageData === null) return false
      const res = await window.invoke("db:savePage", this.current, title, pageData.document, pageData.editor_state)
      if (!res.status) console.error(res.value)
      return res.status
    }
    return false
  }

}
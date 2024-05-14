import { PageData } from "@src/database/model";
import { Editor } from "@src/editor";
import { PubSub } from "@src/pubSub";

export interface IStateManager {
  switchToPage(id: number): boolean
}

export class StateManager implements IStateManager {

  pubSub: PubSub
  editor: Editor

  private current: number | null = null

  private busy: boolean = true

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

    if (await this.openPageInEditor(1))
      this.editor.setEditable(true)

    this.busy = false
  }

  private async openPageInEditor(id: number): Promise<boolean> {
    let res = await window.invoke("db:getPageData", id)
    if (!res.status) return false

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
    return false
  }
}
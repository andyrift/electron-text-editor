import { Node } from "prosemirror-model"
import { EditorView, NodeView } from "prosemirror-view"

import { PubSub } from "@src/pubSub"

export class TitleView implements NodeView {
  dom: HTMLElement
  contentDOM: HTMLElement
  placeholder: HTMLElement

  node: Node
  view: EditorView
  getPos: () => number | undefined

  pubSub: PubSub

  constructor(node: Node, view: EditorView, getPos: () => number | undefined) {
    this.node = node
    this.view = view
    this.getPos = getPos

    this.pubSub = PubSub.getInstance()

    this.dom = document.createElement("title")
    this.contentDOM = document.createElement("div")
    this.placeholder = document.createElement("div")

    this.dom.classList.add(..."mt-1 mb-3 text-4xl font-bold block relative".split(' '))

    this.placeholder.classList.add(..."opacity-30 absolute left-0 top-0 select-none pointer-events-none".split(' '))
    this.placeholder.contentEditable = "false"

    this.placeholder.innerText = "Untitled"

    if (this.contentDOM.innerText.length > 0)
      this.placeholder.classList.add("hidden")

    this.dom.appendChild(this.contentDOM)
    
    this.dom.appendChild(this.placeholder)

    this.pubSub.emit("page-title-changed", node.textContent)
  }

  update(node: Node): boolean {
    if (node.type.name != "title") return false
    if (node.textContent) {
      this.placeholder.classList.add("hidden")
    }
    else {
      this.placeholder.classList.remove("hidden")
    }
    this.pubSub.emit("page-title-changed", node.textContent)
    return true
  }
}
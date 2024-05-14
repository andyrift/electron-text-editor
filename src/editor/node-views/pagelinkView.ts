import { Node } from "prosemirror-model"
import { EditorView, NodeView } from "prosemirror-view"

import { PubSub } from "@src/pubSub"
import { colors } from "../colors"
import { Commands } from "../commands"

export class PageLinkView implements NodeView {
  dom: HTMLElement

  node: Node
  view: EditorView
  getPos: () => number | undefined

  pubSub: PubSub

  id: number
  bgcolor: string
  constructor(node: Node, view: EditorView, getPos: () => number | undefined) {
    this.id = node.attrs["id"]
    this.bgcolor = node.attrs["bgcolor"]
    this.node = node
    this.view = view
    this.getPos = getPos

    this.pubSub = PubSub.getInstance()

    this.dom = document.createElement("pagelink")

    this.dom.classList.add(..."my-1 text-base bg-opacity-30 block text-gray-800".split(' '))
    this.dom.classList.add('bg-' + colors[this.bgcolor]!.class)

    let icon = document.createElement('i')
    icon.classList.add(..."fa-solid fa-file-lines inline ml-0.5 cursor-pointer mr-1.5 text-md my-1 h-fit".split(' '))

    let page = document.createElement('div')
    page.classList.add(..."cursor-pointer inline hover:underline".split(' '))
    if (this.id) {
      let pageitm = window.getters.getWorkspacePages().get(this.id)
      if (pageitm) {
        if (pageitm.title) page.innerText = pageitm.title
        else page.innerText = "Untitled"
        if (pageitm.deleted) page.classList.add(..."line-through text-gray-500".split(' '))
      } else {
        page.innerText = "Error"
      }
    } else {
      page.innerText = "Select Page"
      page.classList.add("text-gray-500")
    }

    this.dom.appendChild(icon)
    this.dom.appendChild(page)

    const handler = (e: MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      if (this.id) {
        this.pubSub.emit("pagelink-open-page", this.id)
      } else {
        let pos = getPos()
        if (pos) this.pubSub.emit('pagelink-select-page', pos, this.id)
      }
    }

    icon.addEventListener('click', (e: MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      let pos = getPos()
      if (pos) this.pubSub.emit('pagelink-select-page', pos, this.id)
    })
    page.addEventListener('click', handler)
  }
}
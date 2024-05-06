import { Node } from "prosemirror-model"
import { EditorView, NodeView } from "prosemirror-view"

import { PubSub } from "@src/pubSub"
import { colors } from "./colors"
import { Commands } from "./commands"

export class CheckView implements NodeView {
  dom: HTMLElement
  contentDOM: HTMLElement
  
  node: Node
  view: EditorView
  getPos: () => number | undefined

  pubSub: PubSub

  check: string
  bgcolor: string
  constructor(node: Node, view: EditorView, getPos: () => number | undefined, cmd: Commands) {
    this.check = node.attrs["check"]
    this.bgcolor = node.attrs["bgcolor"]
    this.node = node
    this.view = view
    this.getPos = getPos

    this.pubSub = PubSub.getInstance()

    this.dom = document.createElement("check")
    this.contentDOM = document.createElement("div")

    this.dom.classList.add(..."my-1 text-base bg-opacity-30 block".split(' '))
    this.dom.classList.add('bg-' + colors[this.bgcolor]!.class)

    let icon = document.createElement('i')
    icon.classList.add(..."ml-0.5 mr-1.5 text-md inline-block cursor-pointer align-top mt-1 h-fit".split(' '))
    icon.style.zIndex = '3'

    this.contentDOM.classList.add(...'inline-block'.split(' '))

    if (this.check == 'true') {
      icon.classList.add("fa-solid")
      icon.classList.add("fa-square-check")
      icon.classList.add("text-blue-500")

      this.contentDOM.classList.add('text-gray-500')
      this.contentDOM.classList.add('line-through')
    } else if (this.check == 'false') {
      icon.classList.add("fa-regular")
      icon.classList.add("fa-square")
      icon.classList.add("text-gray-500")
    }

    icon.addEventListener('mousedown', (e) => {
      e.stopPropagation()
      e.preventDefault()
      let pos = getPos()
      if (pos) cmd.toggleCheck(pos)(view.state, view.dispatch)
    })

    this.dom.appendChild(icon)
    this.dom.appendChild(this.contentDOM)
  }
}

export class PageLinkView implements NodeView {
  dom: HTMLElement

  node: Node
  view: EditorView
  getPos: () => number | undefined

  pubSub: PubSub

  id: number
  bgcolor: string
  constructor(node: Node, view: EditorView, getPos: () => number | undefined, cmd: Commands) {
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
    if(this.id) {
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
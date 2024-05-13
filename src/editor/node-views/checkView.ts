import { Node } from "prosemirror-model"
import { EditorView, NodeView } from "prosemirror-view"

import { PubSub } from "@src/pubSub"
import { colors } from "../colors"
import { Commands } from "../commands"

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

    this.dom.classList.add(..."my-1 text-base bg-opacity-30 block flex flex-nowrap".split(' '))
    this.dom.classList.add('bg-' + colors[this.bgcolor]!.class)

    let icon = document.createElement('i')
    icon.classList.add(..."ml-0.5 mr-1.5 text-md block cursor-pointer align-top mt-1 h-full flex-none".split(' '))
    icon.style.zIndex = '3'

    this.contentDOM.classList.add(...'min-w-1 min-h-1'.split(' '))

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
import { Node, NodeSpec } from "prosemirror-model"

export const listitemDOM: readonly [string, ...any] = [
  "li", { class: "ml-6 pl-1" }, 0
]

export const unorderedlistDOM: readonly [string, ...any] = [
  "ul", { class: "list-disc list-outside [&_ul]:list-[revert]" }, 0
]

export const orderedlistDOM: (node: Node) => readonly [string, ...any] = (node) => {
  let ol: [string, ...any] = [
    "ol", { class: "list-decimal list-outside [&_ol]:list-[revert]" }, 0
  ]
  if (node.attrs["order"] == 1) return ol
  ol[1].start = node.attrs["order"]
  return ol
}

export const ordered_list: NodeSpec = {
  content: "list_item+",
  group: "block",
  attrs: { order: { default: 1 } },
  parseDOM: [{
    tag: "ol", getAttrs(dom: HTMLElement) {
      return { order: dom.hasAttribute("start") ? + dom.getAttribute("start")! : 1 }
    }
  }],
  toDOM(node) {
    return orderedlistDOM(node)
  },
}

export const bullet_list: NodeSpec = {
  content: "list_item+",
  group: "block",
  parseDOM: [{ tag: "ul" }],
  toDOM() { return unorderedlistDOM },
}

export const list_item: NodeSpec = {
  content: "block+",
  parseDOM: [{ tag: "li" }],
  toDOM() { return listitemDOM },
  defining: true,
}
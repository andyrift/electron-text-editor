import { Node, NodeSpec } from "prosemirror-model";

import { mergeClasses, matchColor } from "./helpers";

export const codeblockDOM: readonly [string, ...any] = ["pre", {
  spellcheck: false,
  class: "bg-gray-200 font-bold rounded text-gray-900 py-2 px-3 whitespace-pre",
}, ["code", 0]];

export const checkDOM = (node: Node): readonly [string, ...any] => {
  let classes = "my-1 text-base bg-opacity-30 block"
  classes = mergeClasses(classes, matchColor(node))
  return ["check", { class: classes, bgcolor: node.attrs.bgcolor, check: node.attrs.check }, 0]
}

export const pagelinkDOM = (node: Node): readonly [string, ...any] => {
  let classes = "my-1 text-base bg-opacity-30 block"
  classes = mergeClasses(classes, matchColor(node))
  return ["pagelink", { class: classes, bgcolor: node.attrs.bgcolor, pageid: node.attrs.id }]
}

export const code_block: NodeSpec = {
  content: "text*",
  marks: "",
  group: "block",
  code: true,
  defining: true,
  isolating: true,
  parseDOM: [{ tag: "pre", preserveWhitespace: "full" }],
  toDOM() { return codeblockDOM }
};

export const check: NodeSpec = {
  group: "block",
  content: "inline*",
  attrs: {
    check: { default: 'false' },
    bgcolor: { default: 'none' }
  },
  parseDOM: [{
    tag: "check",
    getAttrs(node) {
      return {
        check: node.getAttribute('check'),
        bgcolor: node.getAttribute('bgcolor')
      }
    }
  }],
  toDOM: checkDOM,
};

export const page_link: NodeSpec = {
  group: "block",
  attrs: {
    id: { default: null },
    bgcolor: { default: 'none' }
  },
  atom: true,
  parseDOM: [{
    tag: "pagelink",
    getAttrs(node) {
      let id = null;
      let attr = node.getAttribute('pageid')
      if (attr) id = parseInt(attr)
      return {
        id,
        bgcolor: node.getAttribute('bgcolor')
      }
    }
  }],
  toDOM: pagelinkDOM,
};

export const image: NodeSpec = {
  inline: true,
  attrs: {
    src: {},
    alt: { default: null },
    title: { default: null }
  },
  group: "block",
  draggable: true,
  parseDOM: [{
    tag: "img[src]", getAttrs(dom: HTMLElement) {
      return {
        src: dom.getAttribute("src"),
        title: dom.getAttribute("title"),
        alt: dom.getAttribute("alt")
      }
    }
  }],
  toDOM(node) { let { src, alt, title } = node.attrs; return ["img", { src, alt, title }] }
};
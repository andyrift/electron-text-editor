import { NodeSpec } from "prosemirror-model";

export const codeblockDOM: readonly [string, ...any] = ["pre", {
  spellcheck: false,
  class: "bg-gray-200 font-bold rounded text-gray-900 py-2 px-3 whitespace-pre",
}, ["code", 0]];

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
import { Mark, MarkSpec } from "prosemirror-model";

export const linkDOM = (mark: Mark): readonly [string, ...any] => {
  let { href, title } = mark.attrs;
  return ["a", { href, title }, 0]
}

export const codeDOM: readonly [string, ...any] = ["code", {
  spellcheck: false,
  class: "bg-gray-200 font-bold rounded text-gray-900 py-0.5 px-1.5"
}, 0];

export const emDOM: readonly [string, ...any] = ["em", 0];
export const strongDOM: readonly [string, ...any] = ["strong", 0];
export const insDOM: readonly [string, ...any] = ["ins", 0];
export const delDOM: readonly [string, ...any] = ["del", 0];

export const link: MarkSpec = {
  attrs: {
    href: {},
    title: { default: null }
  },
  inclusive: false,
  parseDOM: [{
    tag: "a[href]", getAttrs(dom: HTMLElement) {
      return { href: dom.getAttribute("href"), title: dom.getAttribute("title") }
    }
  }],
  toDOM: linkDOM
}

export const code: MarkSpec = {
  parseDOM: [
    { tag: "code" },
  ],
  toDOM() { return codeDOM }
}

export const em: MarkSpec = {
  parseDOM: [
    { tag: "i" }, { tag: "em" },
    { style: "font-style=italic" },
    { style: "font-style=normal", clearMark: m => m.type.name == "em" }
  ],
  toDOM() { return emDOM }
}

export const strong: MarkSpec = {
  parseDOM: [
    { tag: "strong" },
    // This works around a Google Docs misbehavior where
    // pasted content will be inexplicably wrapped in `<b>`
    // tags with a font-weight normal.
    { tag: "b", getAttrs: (node: HTMLElement) => node.style.fontWeight != "normal" && null },
    { style: "font-weight=400", clearMark: m => m.type.name == "strong" },
    { style: "font-weight", getAttrs: (value: string) => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null },
  ],
  toDOM() { return strongDOM }
}

export const ins: MarkSpec = {
  parseDOM: [
    { tag: "ins" },
    { tag: "u" },
  ],
  toDOM() { return insDOM }
}

export const del: MarkSpec = {
  parseDOM: [
    { tag: "del" },
  ],
  toDOM() { return delDOM }
}

export const marks = {
  code,
  em,
  strong,
  ins,
  del
};
import { Schema, Node } from "prosemirror-model"
import { type MutableAttrs } from 'prosemirror-tables';
import type { NodeSpec, MarkSpec, DOMOutputSpec, Attrs, AttributeSpec } from "prosemirror-model"
export const titleDOM : readonly[string, ...any] = ["h1", { 
  class: "mt-1 mb-6 text-4xl font-bold" 
}, 0];

export const paragraphDOM: readonly [string, ...any] = ["p", { 
  class: "my-1 text-base" 
}, 0];

export const headingDOM: (node: Node) => readonly [string, ...any] = (node) => {
  let c = "";
  switch (node.attrs.level) {
    case (1):
      c = "text-3xl mt-8 mb-3 font-medium";
      break;
    case (2):
      c = "text-2xl mt-6 mb-2 font-medium";
      break;
    case (3):
      c = "text-xl mt-4 mb-1 font-medium";
      break;
    default: break;
  }
  return ["h" + node.attrs.level, { class: c }, 0]};

export const codeblockDOM: readonly [string, ...any] = ["pre", { 
  class: "bg-gray-200 font-bold rounded text-gray-900 py-2 px-3" 
}, ["code", 0]];

export const hardbreakDOM: readonly [string, ...any] = ["br"];

export const hrDOM: readonly [string, ...any] = ["hr", { class: "my-2"}];

export const blockquoteDOM: readonly [string, ...any] = ["blockquote", { class: "py-0.5 pl-4 border-l-2 border-gray-300" }, 0];

export const listitemDOM: readonly [string, ...any] = ["li", { class: "ml-6 pl-1" }, 0];

export const unorderedlistDOM: readonly [string, ...any] = ["ul", { class: "list-disc list-outside [&_ul]:list-[revert]" }, 0];

export const orderedlistDOM: (node: Node) => readonly [string, ...any] = (node) => {
  let ol: [string, ...any] = ["ol", {
    class: "list-decimal list-outside [&_ol]:list-[revert]"
  }, 0];
  if (node.attrs.order == 1) return ol;
  ol[1].start = node.attrs.order;
  return ol;
} 

export const doc: NodeSpec = {
  content: "title block+"
};

export const text: NodeSpec = {
  group: "inline",
};

export const hard_break: NodeSpec = {
  group: "inline",
  inline: true,
  selectable: false,
  parseDOM: [{ tag: "br" }],
  toDOM() { return hardbreakDOM }
}

export const horizontal_rule: NodeSpec = {
  group: "block",
  parseDOM: [{ tag: "hr" }],
  toDOM() { return hrDOM }
};

export const blockquote: NodeSpec = {
  content: "block+",
  group: "block",
  defining: true,
  parseDOM: [{ tag: "blockquote" }],
  toDOM() { return blockquoteDOM }
}

export const title: NodeSpec = {
  content: "text*",
  parseDOM: [],
  marks: "",
  toDOM() { return titleDOM },
}

export const paragraph: NodeSpec = {
  group: "block",
  content: "inline*",
  parseDOM: [{ tag: "p" }],
  toDOM() { return paragraphDOM },
};

export const heading: NodeSpec = {
  group: "block",
  content: "text*",
  defining: true,
  marks: "strong em ins del",
  attrs: {
    level: { default: 1 }
  },
  parseDOM: [
    { tag: "h1", attrs: { level: 1 } },
    { tag: "h2", attrs: { level: 2 } },
    { tag: "h3", attrs: { level: 3 } }
  ],
  toDOM(node) {
    return headingDOM(node);
  }
};

export const code_block: NodeSpec = {
  content: "text*",
  marks: "",
  group: "block",
  code: true,
  defining: true,
  parseDOM: [{ tag: "pre", preserveWhitespace: "full" }],
  toDOM() { return codeblockDOM }
};

export const ordered_list: NodeSpec = {
  content: "list_item+",
  group: "block",
  attrs: { order: { default: 1 } },
  parseDOM: [{
    tag: "ol", getAttrs(dom: HTMLElement) {
      return { order: dom.hasAttribute("start")? + dom.getAttribute("start")! : 1 }
    }
  }],
  toDOM(node) {
    return orderedlistDOM(node);
  }
};

export const bullet_list: NodeSpec = {
  content: "list_item+",
  group: "block",
  parseDOM: [{ tag: "ul" }],
  toDOM() { return unorderedlistDOM }
};

export const list_item: NodeSpec = {
  content: "paragraph block*",
  parseDOM: [{ tag: "li" }],
  toDOM() { return listitemDOM },
  defining: true
};

export const table: NodeSpec = {
  content: 'table_row+',
  tableRole: 'table',
  isolating: true,
  group: "block",
  parseDOM: [{ tag: 'table' }],
  toDOM() {
    return ['table', ['tbody', 0]];
  },
};

export const table_row: NodeSpec =  {
  content: '(table_cell | table_header)*',
  tableRole: 'row',
  parseDOM: [{ tag: 'tr' }],
  toDOM() {
    return ['tr', 0];
  },
};

interface CellAttrs {
  colspan: number;
  rowspan: number;
  colwidth: number[] | null;
}

const cellAttrs: Record<string, AttributeSpec> = {
  colspan: { default: 1 },
  rowspan: { default: 1 },
  colwidth: { default: null },
};

const extraAttrs = {};

function getCellAttrs(dom: HTMLElement | string, extraAttrs: Attrs): Attrs {
  if (typeof dom === 'string') {
    return {};
  }

  const widthAttr = dom.getAttribute('data-colwidth');
  const widths =
    widthAttr && /^\d+(,\d+)*$/.test(widthAttr)
      ? widthAttr.split(',').map((s) => Number(s))
      : null;
  const colspan = Number(dom.getAttribute('colspan') || 1);
  const result: MutableAttrs = {
    colspan,
    rowspan: Number(dom.getAttribute('rowspan') || 1),
    colwidth: widths && widths.length == colspan ? widths : null,
  } satisfies CellAttrs;
  for (const prop in extraAttrs) {
    const getter = extraAttrs[prop].getFromDOM;
    const value = getter && getter(dom);
    if (value != null) {
      result[prop] = value;
    }
  }
  return result;
}

function setCellAttrs(node: Node, extraAttrs: Attrs): Attrs {
  const attrs: MutableAttrs = {};
  if (node.attrs.colspan != 1) attrs.colspan = node.attrs.colspan;
  if (node.attrs.rowspan != 1) attrs.rowspan = node.attrs.rowspan;
  if (node.attrs.colwidth)
    attrs['data-colwidth'] = node.attrs.colwidth.join(',');
  for (const prop in extraAttrs) {
    const setter = extraAttrs[prop].setDOMAttr;
    if (setter) setter(node.attrs[prop], attrs);
  }
  return attrs;
}

export const table_cell: NodeSpec = {
  content: "block+",
  attrs: cellAttrs,
  tableRole: 'cell',
  isolating: true,
  parseDOM: [
    { tag: 'td', getAttrs: (dom) => getCellAttrs(dom, extraAttrs) },
  ],
  toDOM(node) {
    return ['td', setCellAttrs(node, extraAttrs), 0];
  },
};

export const table_header: NodeSpec = {
  content: "block+",
  attrs: cellAttrs,
  tableRole: 'header_cell',
  isolating: true,
  parseDOM: [
    { tag: 'th', getAttrs: (dom) => getCellAttrs(dom, extraAttrs) },
  ],
  toDOM(node) {
    return ['th', setCellAttrs(node, extraAttrs), 0];
  },
}

export const image: NodeSpec = {
  inline: true,
  attrs: {
    src: {},
    alt: { default: null },
    title: { default: null }
  },
  group: "inline",
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


export const nodes = {
  doc,
  paragraph,
  heading,
  title,
  code_block,
  text,
  hard_break,
  horizontal_rule,
  bullet_list,
  ordered_list,
  list_item,
  blockquote,
  table,
  table_row,
  table_cell,
  table_header,
}

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
  toDOM(node) { let { href, title } = node.attrs; return ["a", { href, title }, 0] }
}

export const marks = {
  code: {
    parseDOM: [
      { tag: "code" },
    ],
    toDOM() { return ["code", { 
      class: "bg-gray-200 font-bold rounded text-gray-900 py-0.5 px-1.5"
    }, 0] as DOMOutputSpec }
  } as MarkSpec,

  em: {
    parseDOM: [
      { tag: "i" }, { tag: "em" },
      { style: "font-style=italic" },
      { style: "font-style=normal", clearMark: m => m.type.name == "em" }
    ],
    toDOM() { return ["em", 0] as DOMOutputSpec }
  } as MarkSpec,

  strong: {
    parseDOM: [
      { tag: "strong" },
      // This works around a Google Docs misbehavior where
      // pasted content will be inexplicably wrapped in `<b>`
      // tags with a font-weight normal.
      { tag: "b", getAttrs: (node: HTMLElement) => node.style.fontWeight != "normal" && null },
      { style: "font-weight=400", clearMark: m => m.type.name == "strong" },
      { style: "font-weight", getAttrs: (value: string) => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null },
    ],
    toDOM() { return ["strong", 0] as DOMOutputSpec }
  } as MarkSpec,

  ins: {
    parseDOM: [
      { tag: "ins" },
      { tag: "u"},
    ],
    toDOM() { return ["ins", 0] as DOMOutputSpec }
  } as MarkSpec,

  del: {
    parseDOM: [
      { tag: "del" },
    ],
    toDOM() { return ["del", 0] as DOMOutputSpec }
  } as MarkSpec
};

export const schema = new Schema({ nodes, marks });
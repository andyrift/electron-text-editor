import { AttributeSpec, Attrs, Node, NodeSpec } from "prosemirror-model";
import { MutableAttrs } from "prosemirror-tables";

export const table: NodeSpec = {
  content: 'table_row+',
  tableRole: 'table',
  isolating: true,
  draggable: true,
  group: "block",
  parseDOM: [{ tag: 'table' }],
  toDOM() {
    return ['table', ['tbody', 0]];
  },
};

export const table_row: NodeSpec = {
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
import { Node, NodeSpec } from "prosemirror-model";

import { mergeClasses, matchColor, matchHeading } from "./helpers";

export const titleDOM: readonly [string, ...any] = ["h1", {
  class: "mt-1 mb-3 text-4xl font-bold"
}, 0];

export const paragraphDOM = (node: Node): readonly [string, ...any] => {
  let classes = "my-1 text-base bg-opacity-30"
  classes = mergeClasses(classes, matchColor(node))
  return ["p", { class: classes, bgcolor: node.attrs.bgcolor }, 0]
}

export const headingDOM: (node: Node) => readonly [string, ...any] = (node) => {
  let classes = "font-medium bg-opacity-30";
  classes = mergeClasses(classes, matchHeading(node))
  classes = mergeClasses(classes, matchColor(node))
  return ["h" + node.attrs.level, { class: classes }, 0]
};

export const hardbreakDOM: readonly [string, ...any] = ["br"];

export const hrDOM: readonly [string, ...any] = ["hr", { class: "my-2 py-2 border-none" }, ["div", { class: "border-gray-400 border-t"}]];

export const blockquoteDOM: readonly [string, ...any] = ["blockquote", { class: "py-0.5 pl-4 border-l-2 border-gray-300" }, 0];

export const doc: NodeSpec = {
  content: "title (block | column_list)+"
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
  isolating: true,
  parseDOM: [],
  marks: "",
  toDOM() { return titleDOM },
}

export const paragraph: NodeSpec = {
  group: "block",
  content: "inline*",
  attrs: {
    bgcolor: { default: 'none' }
  },
  parseDOM: [{ tag: "p", getAttrs(node) { return { bgcolor: node.getAttribute('bgcolor') } } }],
  toDOM: paragraphDOM,
};

export const heading: NodeSpec = {
  group: "block",
  content: "text*",
  defining: true,
  marks: "strong em ins del",
  attrs: {
    level: { default: 1 },
    bgcolor: { default: 'none' }
  },
  parseDOM: [
    { tag: "h1", getAttrs(node) { return { bgcolor: node.getAttribute('bgcolor'), level: 1 } } },
    { tag: "h2", getAttrs(node) { return { bgcolor: node.getAttribute('bgcolor'), level: 2 } } },
    { tag: "h3", getAttrs(node) { return { bgcolor: node.getAttribute('bgcolor'), level: 3 } } }
  ],
  toDOM(node) {
    return headingDOM(node);
  }
};
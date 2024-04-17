import { Node, NodeSpec } from "prosemirror-model";
import { colors } from '@core'

const mergeClasses = (left: string, right: string): string => {
  if (!left) return right
  if (!right) return left
  if (left && right) return left + ' ' + right
  return ''
}

const matchColor = (node: Node): string => {
  let color = colors[node.attrs.bgcolor]
  if (color) return 'bg-' + color.class
  return ''
}

export const titleDOM: readonly [string, ...any] = ["h1", {
  class: "mt-1 mb-6 text-4xl font-bold"
}, 0];

export const paragraphDOM = (node: Node): readonly [string, ...any] => {
  let classes = "my-1 text-base bg-opacity-30"
  classes = mergeClasses(classes, matchColor(node))
  return ["p", { class: classes, bgcolor: node.attrs.bgcolor }, 0]
}

export const checkDOM = (node: Node): readonly [string, ...any] => {
  let classes = "my-1 text-base bg-opacity-30 block"
  classes = mergeClasses(classes, matchColor(node))
  return ["check", { class: classes, bgcolor: node.attrs.bgcolor, check: node.attrs.check }, 0]
}


const matchHeading = (node: Node): string => {
  switch (node.attrs.level) {
    case (1):
      return "text-3xl mt-8 mb-3"
    case (2):
      return "text-2xl mt-6 mb-2"
    case (3):
      return "text-xl mt-4 mb-1"
    default: return ""
  }
}

export const headingDOM: (node: Node) => readonly [string, ...any] = (node) => {
  let classes = "font-medium bg-opacity-40";
  classes = mergeClasses(classes, matchHeading(node))
  classes = mergeClasses(classes, matchColor(node))
  return ["h" + node.attrs.level, { class: classes }, 0]
};

export const hardbreakDOM: readonly [string, ...any] = ["br"];

export const hrDOM: readonly [string, ...any] = ["hr", { class: "my-4 border-gray-400 border-t" }];

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
    { tag: "h1", attrs: { level: 1 }, getAttrs(node) { return { bgcolor: node.getAttribute('bgcolor') } } },
    { tag: "h2", attrs: { level: 2 }, getAttrs(node) { return { bgcolor: node.getAttribute('bgcolor') } } },
    { tag: "h3", attrs: { level: 3 }, getAttrs(node) { return { bgcolor: node.getAttribute('bgcolor') } } }
  ],
  toDOM(node) {
    return headingDOM(node);
  }
};
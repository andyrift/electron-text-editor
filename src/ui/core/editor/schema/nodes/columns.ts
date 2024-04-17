import { NodeSpec } from "prosemirror-model"

export const columnlistDOM: readonly [string, ...any] = ["columns", {
  class: "flex w-full gap-2"
}, 0];

export const columnDOM: readonly [string, ...any] = ["column", {
  class: "flex-none w-1/2"
}, 0];

export const column_list: NodeSpec = {
  content: "column column",
  isolating: true,
  defining: true,
  parseDOM: [{ tag: "columns" }],
  toDOM() { return columnlistDOM }
}

export const column: NodeSpec = {
  content: "block+",
  isolating: true,
  defining: true,
  parseDOM: [{ tag: "column" }],
  toDOM() { return columnDOM }
}
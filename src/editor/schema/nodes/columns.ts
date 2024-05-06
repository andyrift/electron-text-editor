import { NodeSpec } from "prosemirror-model"

export const columnlistDOM: readonly [string, ...any] = [
  "columns", { class: "w-full flex" }, 0
]

export const columnDOM: readonly [string, ...any] = [
  "column", { class: "flex-none w-1/2 pr-4 pt-4" }, 0
]

export const column_list: NodeSpec = {
  content: "column column",
  isolating: true,
  parseDOM: [{ tag: "columns" }],
  toDOM() { return columnlistDOM },
}

export const column: NodeSpec = {
  content: "block+",
  isolating: true,
  parseDOM: [{ tag: "column" }],
  toDOM() { return columnDOM },
}
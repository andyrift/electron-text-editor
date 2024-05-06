import { doc, blockquote, hard_break, heading, horizontal_rule, paragraph, text, title } from "./basic"
import { column_list, column } from "./columns"
import { bullet_list, ordered_list, list_item } from "./lists"
import { table, table_row, table_cell, table_header } from "./tables"
import { code_block, check, page_link } from "./fancy"

export * from "./basic"
export * from "./columns"
export * from "./lists"
export * from "./tables"
export * from "./fancy"

export const nodes = {
  doc,
  title,
  paragraph, // block
  heading, // block
  check, // block

  text, // inline
  hard_break, // inline

  horizontal_rule, // block
  
  blockquote, // block

  column_list,
  column,

  bullet_list, // block
  ordered_list, // block
  list_item,

  table, // block
  table_row,
  table_cell,
  table_header,

  code_block, // block
  page_link,
}
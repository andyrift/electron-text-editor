import {
  chainCommands,
  deleteSelection,
  joinForward,
  selectNodeForward,
  joinBackward,
  selectNodeBackward,
  exitTitle,
  newlineInCode,
  splitListItem,
  createParagraphNear,
  liftEmptyBlock,
  splitBlock,
  exitCode,
  hardBreak,
  selectAll,
  wrapInList,
  horizontalRule,
  wrapIn,
  sinkListItem,
  lift,
  liftListItem,
  setBlockType,
  toggleMark,
  selectBlock,
  selectText,
  insertTable,
  tab_code,
  shift_tab_code
} from "./rawCommands";

import type { Command } from "prosemirror-state";
import { Schema } from "prosemirror-model";

export interface Commands {
  del: Command;
  backspace: Command;
  enter: Command;
  ctrl_enter: Command;
  tab: Command;
  shift_tab: Command;
  selectAll: Command;
  selectSteps: Command;
  bulletList: Command;
  orderedList: Command;
  horizontalRule: Command;
  blockquote: Command;
  block: {
    paragraph: Command;
    h1: Command;
    h2: Command;
    h3: Command;
    code: Command;
    table: Command;
  };
  mark: {
    bold: Command;
    italic: Command;
    underline: Command;
    strikethrough: Command;
    code: Command;
  }
}

export class Commands {
  constructor(schema: Schema) {
    this.del = chainCommands(
      deleteSelection,
      joinForward,
      selectNodeForward
    );
    this.backspace = chainCommands(
      deleteSelection,
      joinBackward,
      selectNodeBackward
    );
    this.enter = chainCommands(
      exitTitle,
      newlineInCode,
      splitListItem(schema.nodes.list_item),
      createParagraphNear,
      liftEmptyBlock,
      splitBlock
    );
    this.ctrl_enter = chainCommands(
      exitTitle,
      exitCode,
      hardBreak(schema.nodes.hard_break)
    );
    this.tab = chainCommands(
      tab_code,
      sinkListItem(schema.nodes.list_item),
      wrapIn(schema.nodes.blockquote)
    );
    this.shift_tab = chainCommands(
      shift_tab_code,
      liftListItem(schema.nodes.list_item),
      lift
    );
    this.selectAll = chainCommands(
      selectText,
      selectAll
    );
    this.selectSteps = chainCommands(
      selectBlock,
      selectAll
    );
    this.bulletList = wrapInList(schema.nodes.bullet_list);
    this.orderedList = wrapInList(schema.nodes.ordered_list);
    this.horizontalRule = horizontalRule(schema.nodes.horizontal_rule);
    this.blockquote = wrapIn(schema.nodes.blockquote);

    this.block = {
      paragraph: setBlockType(schema.nodes.paragraph),
      h1: setBlockType(schema.nodes.heading, { level: 1 }),
      h2: setBlockType(schema.nodes.heading, { level: 2 }),
      h3: setBlockType(schema.nodes.heading, { level: 3 }),
      code: setBlockType(schema.nodes.code_block),
      table: insertTable(),
    };

    this.mark = {
      bold: toggleMark(schema.marks.strong),
      italic: toggleMark(schema.marks.em),
      underline: toggleMark(schema.marks.ins),
      strikethrough: toggleMark(schema.marks.del),
      code: toggleMark(schema.marks.code)
    }

  }
}
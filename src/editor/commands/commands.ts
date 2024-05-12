import {
  deleteSelection,
  selectNodeBackward,
  selectNodeForward,
  selectAll,
  selectParentNode,

  exitCode,
  newlineInCode,

  createParagraphNear,
  toggleMark,
  setBlockType,

  liftEmptyBlock,
  lift,
  joinBackward,
  joinForward,
  joinUp,
  joinDown,
  wrapIn,

  undo,
  redo,

  addColumnBefore,
  addColumnAfter,
  deleteColumn,
  addRowBefore,
  addRowAfter,
  deleteRow,
  mergeCells,
  splitCell,
  toggleHeaderCell,
  toggleHeaderColumn,
  toggleHeaderRow,
  goToNextCell,
  deleteTable,

} from './outerCommands'

import {
  liftListItem,
  sinkListItem,
  splitListItem,
  wrapInList,
} from './listCommands'

import {
  chainCommands,
  deleteColumns,
  exitTitle,
  selectBlock,
  selectText,
  setNodeColor,
  setPageLink,
  shift_tab_code,
  splitBlock,
  tab_code,
  toggleCheck,
  deleteCurrent,
  checkToParagraph,
  deleteCheck
} from './newCommands'

import {
  hardBreak,
  horizontalRule,
  insertColumns,
  insertPageLink,
  insertTable,
} from './inserts'


import type { Command } from "prosemirror-state";
import { Schema } from "prosemirror-model";

export class Commands {
  setNodeColor = setNodeColor;
  del = chainCommands(
    deleteSelection,
    joinForward,
    selectNodeForward
  );
  backspace = chainCommands(
    deleteColumns,
    deleteCheck,
    deleteSelection,
    joinBackward,
    selectNodeBackward
  );
  enter: Command;
  ctrl_enter: Command;
  tab: Command;
  shift_tab: Command;
  selectAll = chainCommands(
    selectText,
    selectAll
  );
  selectSteps = chainCommands(
    selectBlock,
    selectAll
  );
  table = insertTable(2, 3);
  columns = insertColumns()
  bulletList: Command;
  orderedList: Command;
  blockquote: Command;

  horizontalRule: Command;

  block: {
    paragraph: Command;
    h1: Command;
    h2: Command;
    h3: Command;
    code: Command;
    check: Command;
  };

  mark: {
    bold: Command;
    italic: Command;
    underline: Command;
    strikethrough: Command;
    code: Command;
  };

  toggleCheck = toggleCheck
  insertPageLink = insertPageLink
  setPageLink = setPageLink

  deleteCurrent = deleteCurrent

  undo = undo
  redo = redo

  addColumnBefore = addColumnBefore
  addColumnAfter = addColumnAfter
  addRowBefore = addRowBefore
  addRowAfter = addRowAfter
  deleteColumn = deleteColumn
  deleteRow = deleteRow
  mergeCells = mergeCells
  splitCell = splitCell
  toggleHeaderCell = toggleHeaderCell
  toggleHeaderColumn = toggleHeaderColumn
  toggleHeaderRow = toggleHeaderRow
  goToCellForward = goToNextCell(1)
  goToCellBackward = goToNextCell(-1)
  deleteTable = deleteTable

  constructor(schema: Schema) {
    this.enter = chainCommands(
      exitTitle,
      newlineInCode,
      splitListItem(schema.nodes["list_item"]!),
      createParagraphNear,
      liftEmptyBlock,
      splitBlock(schema)
    );
    this.ctrl_enter = chainCommands(
      exitTitle,
      exitCode,
      hardBreak(schema.nodes["hard_break"]!)
    );
    this.tab = chainCommands(
      tab_code,
      sinkListItem(schema.nodes["list_item"]!),
      wrapIn(schema.nodes["blockquote"]!)
    );
    this.shift_tab = chainCommands(
      shift_tab_code,
      checkToParagraph,
      liftListItem(schema.nodes["list_item"]!),
      lift
    );
    this.bulletList = wrapInList(schema.nodes["bullet_list"]!);
    this.orderedList = wrapInList(schema.nodes["ordered_list"]!);
    this.blockquote = wrapIn(schema.nodes["blockquote"]!);
    this.horizontalRule = horizontalRule(schema.nodes["horizontal_rule"]!);

    this.block = {
      paragraph: setBlockType(schema.nodes["paragraph"]!),
      h1: setBlockType(schema.nodes["heading"]!, { level: 1 }),
      h2: setBlockType(schema.nodes["heading"]!, { level: 2 }),
      h3: setBlockType(schema.nodes["heading"]!, { level: 3 }),
      code: setBlockType(schema.nodes["code_block"]!),
      check: setBlockType(schema.nodes["check"]!),
    };

    this.mark = {
      bold: toggleMark(schema.marks["strong"]!),
      italic: toggleMark(schema.marks["em"]!),
      underline: toggleMark(schema.marks["ins"]!),
      strikethrough: toggleMark(schema.marks["del"]!),
      code: toggleMark(schema.marks["code"]!)
    }

  }
}
import {
  joinPoint, canJoin, findWrapping, liftTarget, canSplit,
  ReplaceStep, ReplaceAroundStep, replaceStep
} from "prosemirror-transform"
import { Slice, Fragment, Node, NodeType, type Attrs, MarkType, ResolvedPos, ContentMatch, Schema } from "prosemirror-model"
import {
  Selection, EditorState, Transaction, TextSelection, NodeSelection,
  SelectionRange, AllSelection, type Command
} from "prosemirror-state"
import { EditorView } from "prosemirror-view"
import { CellSelection } from "prosemirror-tables"
import { splitBlockAs } from "prosemirror-commands"

export function hardBreak(hard_break: NodeType): Command {
  return (state, dispatch) => {
    if (dispatch) {
      let tr = state.tr;
      tr.replaceSelectionWith(hard_break.create());
      dispatch(tr.scrollIntoView());
    }
    return true;
  };
}

function afterSelection(tr: Transaction) {
  if (tr.selection instanceof NodeSelection) return tr.selection.head
  let pos = Math.max(tr.selection.from, tr.selection.to)
  if (pos == tr.doc.content.size) return pos
  let $pos = tr.doc.resolve(pos)
  if ($pos.parent == tr.doc) return pos
  return $pos.after()
}

export function horizontalRule(horizontal_rule: NodeType): Command {
  return (state, dispatch) => {
    if (dispatch) {
      let tr = state.tr;
      tr.insert(afterSelection(tr), horizontal_rule.create())
      dispatch(tr.scrollIntoView());
    }
    return true;
  };
}

export function insertTable(rows: number, cols: number) {
  return (state: EditorState, dispatch: ((tr: Transaction) => void) | undefined): boolean => {
    const cells: Array<Node> = [];
    for (let i = 0; i < rows * cols; i++) {
      let cell = state.schema.nodes["table_cell"]!.createAndFill()
      if (!cell) return false;
      cells.push(cell);
    }
    const trows: Array<Node> = [];
    for (let i = 0; i < rows; i++) {
      let rcells = cells.slice(i * cols, (i + 1) * cols)
      let row = state.schema.nodes["table_row"]!.create(null, Fragment.fromArray(rcells))
      if (!row) return false;
      trows.push(row);
    }
    const node: Node = state.schema.nodes["table"]!.create(null, Fragment.fromArray(trows));

    if (dispatch) {
      let tr = state.tr;
      let pos = afterSelection(tr)
      tr.insert(pos, node)
      tr.setSelection(TextSelection.near(tr.doc.resolve(pos)))
      dispatch(tr.scrollIntoView());
    }

    return true;
  };
}

export function insertColumns() {
  return (state: EditorState, dispatch: ((tr: Transaction) => void) | undefined): boolean => {
    const offset: number = state.tr.selection.head;
    const node = state.schema.nodes["column_list"]!.createAndFill();
    if (!node) return false;

    if (dispatch) {
      let tr = state.tr;
      let pos = afterSelection(tr)
      tr.insert(pos, node)
      tr.setSelection(TextSelection.near(tr.doc.resolve(pos)))
      dispatch(tr.scrollIntoView());
    }

    return true;
  };
}

export function insertPageLink(id: number | null) {
  return (state: EditorState, dispatch: ((tr: Transaction) => void) | undefined): boolean => {
    const node: Node = state.schema.nodes["page_link"]!.create({ id });

    if (dispatch) {
      let tr = state.tr;
      let pos = afterSelection(tr)
      tr.insert(pos, node)
      tr.setSelection(TextSelection.near(tr.doc.resolve(pos)))
      dispatch(tr.scrollIntoView());
    }

    return true;
  };
}
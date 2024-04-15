import {
  joinPoint, canJoin, findWrapping, liftTarget, canSplit,
  ReplaceStep, ReplaceAroundStep, replaceStep
} from "prosemirror-transform"
import { Slice, Fragment, Node, NodeType, type Attrs, MarkType, ResolvedPos, ContentMatch } from "prosemirror-model"
import {
  Selection, EditorState, Transaction, TextSelection, NodeSelection,
  SelectionRange, AllSelection, type Command
} from "prosemirror-state"
import { EditorView } from "prosemirror-view"

export function chainCommands(...commands: readonly Command[]): Command {
  return function (state, dispatch, view) {
    for (let i = 0; i < commands.length; i++)
      if (commands[i](state, dispatch, view)) {
        //console.log("command with idex of", i, "returned true");
        return true
      }
    return false
  }
}

export const hardBreak: (hard_break: NodeType) => Command = (hard_break) => {
  return (state, dispatch) => {
    if (dispatch) {
      let tr = state.tr;
      tr.replaceSelectionWith(hard_break.create());
      dispatch(tr.scrollIntoView());
    }
    return true;
  };
}

export const tab_code: Command = (state: EditorState, dispatch?: (tr: Transaction) => void) => {
  if (state.selection.$from.parent != state.selection.$to.parent) return false;
  if (state.selection.$from.parent.type != state.schema.nodes.code_block) return false;
  if (dispatch) {
    let tr = state.tr;
    tr.replaceSelectionWith(state.schema.text('\t'));
    dispatch(tr.scrollIntoView());
  }
  return true;
}

export const shift_tab_code: Command = (state: EditorState, dispatch?: (tr: Transaction) => void) => {
  if (state.selection.$from.parent != state.selection.$to.parent) return false;
  if (state.selection.$from.parent.type != state.schema.nodes.code_block) return false;
  if (dispatch) { }
  return true;
}

export const horizontalRule: (horizontal_rule: NodeType) => Command = (horizontal_rule) => {
  return (state, dispatch) => {
    if (dispatch) {
      let tr = state.tr;
      tr.replaceSelectionWith(horizontal_rule.create());
      dispatch(tr.scrollIntoView());
    }
    return true;
  };
}

export const exitTitle = (state: EditorState, dispatch?: (tr: Transaction) => void) => {
  let active = false;
  let node: Node | null = null;
  for (let i = 0; i < state.selection.ranges.length; i++) {
    let { $from, $to } = state.selection.ranges[i]
    state.doc.nodesBetween($from.pos, $to.pos, (n, pos, parent, index) => {
      if (n.hasMarkup(state.schema.nodes.title)) {
        active = true;
        node = n;
      }
    })
  }
  if (!active) return false;
  if (dispatch) {
    let tr = state.tr;
    tr.setSelection(Selection.near(
      tr.doc.resolve(
        Selection.near(
          tr.doc.resolve(
            0)
        ).$head.after()
      )));
    dispatch(tr.scrollIntoView());
  }
  return true;
}

export const selectText: Command = (state: EditorState, dispatch?: (tr: Transaction) => void) => {
  let sel = state.selection
  if (sel.$anchor.parent != sel.$head.parent) return false;
  if (!sel.$anchor.parent.isTextblock) return false;
  let $anchor = state.doc.resolve(sel.$anchor.start());
  let $head = state.doc.resolve(sel.$anchor.end());
  if ($anchor == sel.$anchor && $head == sel.$head) return false;
  if (dispatch) dispatch(state.tr.setSelection(new TextSelection($anchor, $head)));
  return true
}

export const selectBlock: Command = (state: EditorState, dispatch?: (tr: Transaction) => void) => {
  let sel = state.selection
  if (sel.$from.parent != sel.$to.parent) return false;
  if (sel.$from.parent == state.doc) return false;
  let pos = sel.$from.before();
  if (dispatch) dispatch(state.tr.setSelection(new NodeSelection(state.doc.resolve(pos))));
  return true
}

export function insertTable() {
  return (
    state: EditorState,
    dispatch: ((tr: Transaction) => void) | undefined
  ): boolean => {
    const offset: number = state.tr.selection.anchor + 1;
    const transaction: Transaction = state.tr;
    const cell: Node | null = state.schema.nodes.table_cell.createAndFill();
    if (!cell) return false;
    const node: Node = state.schema.nodes.table.create(
      null,
      Fragment.fromArray([
        state.schema.nodes.table_row.create(
          null,
          Fragment.fromArray([cell, cell])
        )
      ])
    );

    if (dispatch) {
      dispatch(
        transaction
          .replaceSelectionWith(node)
          .scrollIntoView()
          .setSelection(
            TextSelection.near(
              transaction.doc.resolve(offset)
            )
          )
      );
    }

    return true;
  };
}
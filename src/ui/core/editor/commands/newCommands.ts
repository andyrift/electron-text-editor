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

export function chainCommands(...commands: readonly Command[]): Command {
  return function (state, dispatch, view) {
    for (let i = 0; i < commands.length; i++)
      if (commands[i](state, dispatch, view)) {
        //console.log(i, commands[i]);
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
  if ($anchor.pos == sel.$anchor.pos && $head.pos == sel.$head.pos) return false;
  if (dispatch) dispatch(state.tr.setSelection(new TextSelection($anchor, $head)));
  console.log('selected text')
  return true
}

export const selectBlock: Command = (state: EditorState, dispatch?: (tr: Transaction) => void) => {
  let sel = state.selection
  if (sel instanceof CellSelection) return false;
  if (sel.$from.parent != sel.$to.parent) return false;
  if (sel.$from.parent == state.doc) return false;
  let pos = sel.$from.before();
  if (dispatch) dispatch(state.tr.setSelection(new NodeSelection(state.doc.resolve(pos))));
  return true
}

export function insertTable(rows: number, cols: number) {
  return (state: EditorState, dispatch: ((tr: Transaction) => void) | undefined): boolean => {
    const offset: number = state.tr.selection.anchor + 1;
    const cells: Array<Node> = [];
    for (let i = 0; i < rows * cols; i++) {
      let cell = state.schema.nodes.table_cell.createAndFill()
      if (!cell) return false;
      cells.push(cell);
    }
    const trows: Array<Node> = [];
    for (let i = 0; i < rows; i++) {
      let rcells = cells.slice(i * cols, (i + 1) * cols)
      let row = state.schema.nodes.table_row.create(null, Fragment.fromArray(rcells))
      if (!row) return false;
      trows.push(row);
    }
    const node: Node = state.schema.nodes.table.create(null, Fragment.fromArray(trows));

    if (dispatch) {
      let tr = state.tr;
      tr.replaceSelectionWith(node);
      tr.setSelection(TextSelection.near(tr.doc.resolve(offset)))
      dispatch(tr.scrollIntoView());
    }

    return true;
  };
}

export function insertColumns() {
  return (state: EditorState, dispatch: ((tr: Transaction) => void) | undefined): boolean => {
    const offset: number = state.tr.selection.anchor + 1;
    const node = state.schema.nodes.column_list.createAndFill();
    if (!node) return false;

    if (dispatch) {
      let tr = state.tr;
      tr.replaceSelectionWith(node);
      tr.setSelection(TextSelection.near(tr.doc.resolve(offset)))
      dispatch(tr.scrollIntoView());
    }

    return true;
  };
}

export const deleteColumns = (state: EditorState, dispatch: ((tr: Transaction) => void) | undefined): boolean => {
  if (!state.selection.empty) return false
  let before = state.doc.resolve(state.selection.$from.before());
  if (before.parent.type != state.schema.nodes.column) return false
  if (before.parent.content.size != 2) return false;
  let after = state.doc.resolve(before.after())
  if (state.doc.nodeAt(after.pos)?.content.size != 2) return false;
  let start = state.doc.resolve(before.before(before.depth-1))
  if (!state.doc.nodeAt(start.pos)) return false


  if (dispatch) {
    let tr = state.tr;
    tr.setSelection(NodeSelection.create(tr.doc, start.pos))
    tr.deleteSelection()
    dispatch(tr.scrollIntoView())
  }

  return true;
}

export const setNodeColor = (color: string) => (state: EditorState, dispatch: ((tr: Transaction) => void) | undefined): boolean => {
  let sel = state.selection;
  let poss: number[] = []
  state.doc.nodesBetween(sel.from, sel.to, (node, pos) => {
    if ('bgcolor' in node.attrs) {
      poss.push(pos);
    }
  })
  if (!poss.length) return false;

  if (dispatch) {
    let tr = state.tr;
    poss.forEach(pos => {
      tr = tr.setNodeAttribute(pos, 'bgcolor', color);
    })
    dispatch(tr.scrollIntoView())
  }

  return true;
}

export const toggleCheck = (pos: number) => (state: EditorState, dispatch: ((tr: Transaction) => void) | undefined): boolean => {
  let node = state.doc.nodeAt(pos);
  if (!node) return false;
  if (node.type != state.schema.nodes.check) return false;
  let check = node.attrs.check;
  if (check == 'false') check = 'true'
  else check = 'false'

  if (dispatch) {
    let tr = state.tr;
    tr = tr.setNodeAttribute(pos, 'check', check);
    dispatch(tr)
  }

  return true;
}

const splitNode = (schema: Schema) => (node: Node, atEnd: boolean) : { type: NodeType, attrs ?: Attrs } | null => {
  if (node.type == schema.nodes.check) {
    if (node.content.size == 0) return null
    return { type: schema.nodes.check, attrs: { bgcolor: node.attrs.bgcolor } }
  }
  return null
}

export const splitBlock = (schema: Schema) => splitBlockAs(splitNode(schema))
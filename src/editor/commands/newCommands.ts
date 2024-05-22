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
    return commands.some(command => {
      if (command(state, dispatch, view)) return true
      return
    })
  }
}

export function tab_code(state: EditorState, dispatch?: (tr: Transaction) => void): boolean {
  if (state.selection.$from.parent != state.selection.$to.parent) return false;
  if (state.selection.$from.parent.type.name != "code_block") return false;
  if (dispatch) {
    let tr = state.tr;
    tr.replaceSelectionWith(state.schema.text('\t'));
    dispatch(tr.scrollIntoView());
  }
  return true;
}

export function shift_tab_code(state: EditorState, dispatch?: (tr: Transaction) => void): boolean {
  if (state.selection.$from.parent != state.selection.$to.parent) return false;
  if (state.selection.$from.parent.type.name != "code_block") return false;
  if (dispatch) { }
  return true;
}

export function exitTitle(state: EditorState, dispatch?: (tr: Transaction) => void): boolean {
  let active = false;
  state.selection.ranges.forEach(({ $from, $to }) => {
    state.doc.nodesBetween($from.pos, $to.pos, n => {
      if (n.hasMarkup(state.schema.nodes["title"]!)) {
        active = true;
      }
    })
  })
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

export const deleteColumns = (state: EditorState, dispatch: ((tr: Transaction) => void) | undefined): boolean => {
  if (!state.selection.empty) return false
  let before = state.doc.resolve(state.selection.$from.before());
  if (before.parent.type.name != "column") return false
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
  if (node.type.name != "check") return false;
  let check = node.attrs["check"];
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
  if (node.type.name == "check") {
    if (node.content.size == 0) return null
    return { type: schema.nodes["check"]!, attrs: { bgcolor: node.attrs["bgcolor"] } }
  }
  return null
}

export const splitBlock = (schema: Schema) => splitBlockAs(splitNode(schema))

export function setPageLink(pos: number, id: number | null) {
  return (state: EditorState, dispatch: ((tr: Transaction) => void) | undefined): boolean => {
    let node = state.doc.nodeAt(pos);
    if (!node) return false;
    if (node.type.name != "page_link") return false;


    if (dispatch) {
      let tr = state.tr;
      tr = tr.setNodeAttribute(pos, 'id', id);
      dispatch(tr)
    }

    return true;
  };
}

/// Deletes current selection, or, if it is empty, current block
export function deleteCurrent (state: EditorState, dispatch: ((tr: Transaction) => void) | undefined): boolean {
  if (dispatch) {
    const tr = state.tr
    const sel = tr.selection
    if (sel.empty) {
      const before = sel.$anchor.before()
      tr.setSelection(NodeSelection.create(tr.doc, before))
    }
    tr.deleteSelection()
    dispatch(tr.scrollIntoView())
  }
  return true
}

export const checkToParagraph = (state: EditorState, dispatch: ((tr: Transaction) => void) | undefined): boolean => {
  let sel = state.selection;
  let poss: number[] = []
  if (!sel.empty) {
    if (sel instanceof NodeSelection) {
      if (sel.node.type.name != "check") return false
    }
    else if (sel instanceof CellSelection) return false
  }

  if (sel instanceof TextSelection) {
    let flag = true;
    state.doc.nodesBetween(sel.from, sel.to, (node, pos) => {
      if (node.type.name != "check" && node.type.name != "text") {
        //flag = false;
        //console.log(node.type.name)
        //return false;
      } else if (node.type.name != "text") {
        poss.push(pos)
      }
    })
    if (!flag) return false;
    if (poss.length == 0) return false
  }
  
  if (dispatch) {
    let tr = state.tr;
    let sel = tr.selection;
    if (sel instanceof NodeSelection) {
      tr.setBlockType(sel.from, sel.to, state.schema.nodes["paragraph"]!, { bgcolor: sel.node.attrs["bgcolor"] })
    } else if (sel instanceof TextSelection){
      poss.forEach(pos => {
        let node = tr.doc.nodeAt(tr.mapping.map(pos))
        if (node) {
          tr.setBlockType(pos + 1, undefined, state.schema.nodes["paragraph"]!, { bgcolor: node.attrs["bgcolor"] })
        }
      })
    } else {
      console.log('nuh uh')
      return false
    }
    dispatch(tr.scrollIntoView())
  }

  return true;
}

export const deleteCheck = (state: EditorState, dispatch: ((tr: Transaction) => void) | undefined): boolean => {
  if (!state.selection.empty) return false
  if (state.selection.$anchor.parent.type.name != "check") return false;

  const before = state.doc.resolve(state.selection.$from.before());

  if (state.selection.from != before.pos + 1) return false;
  
  const node = state.doc.nodeAt(before.pos)
  if (!node) return false
  if (node.type.name != "check") return false;
  const pos = before.pos


  if (dispatch) {
    let tr = state.tr;
    tr.setBlockType(pos + 1, undefined, state.schema.nodes["paragraph"]!, { bgcolor: node.attrs["bgcolor"] })
    dispatch(tr.scrollIntoView())
  }

  return true;
}
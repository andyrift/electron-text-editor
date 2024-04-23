import { type Command, Plugin } from "prosemirror-state"
import { type Attrs, MarkType, NodeType } from "prosemirror-model";
import { EditorView } from "prosemirror-view";
import type { Menu } from "../menu";

export interface MenuView {
  editorView: EditorView,
  commandApplicable: Array<{ command: Command, set: Function }>
  markActive: Array<{ marktype: MarkType, set: Function }>,
  nodeActive: Array<{ nodetype: NodeType, attrs: Attrs | undefined, set: Function }>,
}

export class MenuView {
  constructor(editorView: EditorView,
    commandApplicable: MenuView["commandApplicable"],
    markActive: MenuView["markActive"],
    nodeActive: MenuView["nodeActive"]) {
    this.editorView = editorView;
    this.commandApplicable = commandApplicable;
    this.markActive = markActive;
    this.nodeActive = nodeActive;
  }

  update() {

    let state = this.editorView.state;

    this.commandApplicable.forEach(({ command, set }) => {
      set(command(state, undefined, this.editorView));
    });

    this.markActive.forEach(({ marktype, set }) => {
      let { from, $from, to, empty } = state.selection;
      if (empty) set(!!marktype.isInSet(state.storedMarks || $from.marks()));
      else set(state.doc.rangeHasMark(from, to, marktype))
    });

    
    this.nodeActive.forEach(({ nodetype, attrs, set }) => {
      let active = false;
      state.selection.ranges.forEach(({ $from, $to }) => {
        state.doc.nodesBetween($from.pos, $to.pos, (node) => {
          if (node.type != nodetype) return;
          let maybe = true;
          for (let key in attrs) {
            if (attrs[key] != node.attrs[key]) {
              maybe = false;
              break
            }
          }
          active ||= maybe;
        })
      })
      
      set(active);
    });
  }
}

export const menuPlugin = (menu : Menu) => {
  return new Plugin({
    view(editorView) {
      let commandApplicable: MenuView["commandApplicable"] = [];
      let markActive: MenuView["markActive"] = [];
      let nodeActive: MenuView["nodeActive"] = [];

      for (let key in menu.commands) {
        let command = menu.commands[key];
        let set = menu.commandSetters[key];
        commandApplicable.push({ command, set });
      }

      for (let key in menu.marks) {
        let marktype = menu.marks[key];
        let set = menu.markSetters[key];
        markActive.push({ marktype, set });
      }

      for (let key in menu.nodes) {
        let { nodetype, attrs } = menu.nodes[key];
        let set = menu.nodeSetters[key];
        nodeActive.push({ nodetype, attrs, set });
      }

      menu.createButtons(editorView);

      return new MenuView(editorView, commandApplicable, markActive, nodeActive);
    }
  })
};
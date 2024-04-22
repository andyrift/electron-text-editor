import { Commands } from "./commands";

import { EditorView } from "prosemirror-view";
import { ref, type Ref } from "vue";
import { MarkType, NodeType, Schema, type Attrs } from "prosemirror-model";
import type { Command } from "prosemirror-state";

import { colors } from "@core";

export type MenuCommands = { [id: string]: (Command) };
export type MenuMarks = { [id: string]: MarkType };
export type MenuNodes = { [id: string]: { nodetype: NodeType, attrs?: Attrs } };
export type MenuSets = { [id: string]: (state: boolean) => void };

export type MenuButtons = Ref<{ [id: string]: Function }>;
export type MenuStates = Ref<{
  [id: string]: {
    node?: boolean,
    mark?: boolean,
    applicable?: boolean
  }
}>;

export class Menu {
  states: MenuStates;
  commands: MenuCommands;
  nodes: MenuNodes;
  marks: MenuMarks;
  commandSetters: MenuSets;
  nodeSetters: MenuSets;
  markSetters: MenuSets;
  buttons: MenuButtons;
  private cmd: Commands;
  constructor(schema: Schema, cmd: Commands) {

    this.cmd = cmd;

    const states: MenuStates = ref({});

    states.value["bold"] = { mark: false, applicable: true };
    states.value["italic"] = { mark: false, applicable: true };
    states.value["underline"] = { mark: false, applicable: true };
    states.value["strikethrough"] = { mark: false, applicable: true };
    states.value["code"] = { mark: false, applicable: true };

    states.value["title"] = { node: false };
    states.value["paragraph"] = { applicable: true, node: false };
    states.value["h1"] = { applicable: true, node: false };
    states.value["h2"] = { applicable: true, node: false };
    states.value["h3"] = { applicable: true, node: false };
    states.value["check"] = { applicable: true, node: false };
    states.value["code_block"] = { applicable: true, node: false };
    states.value["ol"] = { applicable: true, node: false };
    states.value["ul"] = { applicable: true, node: false };
    states.value["indent"] = { applicable: true };
    states.value["outdent"] = { applicable: true };

    states.value["hr"] = { applicable: true };
    states.value["table"] = { applicable: true };
    states.value["columns"] = { applicable: true };
    states.value["pagelink"] = { applicable: true };

    states.value["t_col_before"] = { applicable: true };
    states.value["t_col_after"] = { applicable: true };
    states.value["t_row_before"] = { applicable: true };
    states.value["t_row_after"] = { applicable: true };
    states.value["t_del_col"] = { applicable: true };
    states.value["t_del_row"] = { applicable: true };
    states.value["t_merge_cell"] = { applicable: true };
    states.value["t_split_cell"] = { applicable: true };
    states.value["t_head_cell"] = { applicable: true };
    states.value["t_head_col"] = { applicable: true };
    states.value["t_head_row"] = { applicable: true };
    states.value["t_cell_forward"] = { applicable: true };
    states.value["t_cell_backward"] = { applicable: true };
    states.value["t_delete"] = { applicable: true };

    states.value["delete"] = { applicable: true };

    this.states = states;

    const commands: MenuCommands = {};

    commands["bold"] = cmd.mark.bold;
    commands["italic"] = cmd.mark.italic;
    commands["underline"] = cmd.mark.underline;
    commands["strikethrough"] = cmd.mark.strikethrough;
    commands["code"] = cmd.mark.code;

    commands["paragraph"] = cmd.block.paragraph;
    commands["h1"] = cmd.block.h1;
    commands["h2"] = cmd.block.h2;
    commands["h3"] = cmd.block.h3;
    commands["check"] = cmd.block.check;
    commands["code_block"] = cmd.block.code;

    commands["ul"] = cmd.bulletList;
    commands["ol"] = cmd.orderedList;

    commands["indent"] = cmd.tab;
    commands["outdent"] = cmd.shift_tab;

    commands["hr"] = cmd.horizontalRule;
    commands["table"] = cmd.table;
    commands["columns"] = cmd.columns;
    commands["pagelink"] = cmd.insertPageLink(null);

    commands["t_col_before"] = cmd.addColumnBefore
    commands["t_col_after"] = cmd.addColumnAfter
    commands["t_row_before"] = cmd.addRowBefore
    commands["t_row_after"] = cmd.addRowAfter
    commands["t_del_col"] = cmd.deleteColumn
    commands["t_del_row"] = cmd.deleteRow
    commands["t_merge_cell"] = cmd.mergeCells
    commands["t_split_cell"] = cmd.splitCell
    commands["t_head_cell"] = cmd.toggleHeaderCell
    commands["t_head_col"] = cmd.toggleHeaderColumn
    commands["t_head_row"] = cmd.toggleHeaderRow
    commands["t_cell_forward"] = cmd.goToCellForward
    commands["t_cell_backward"] = cmd.goToCellBackward
    commands["t_delete"] = cmd.deleteTable

    commands["delete"] = cmd.deleteCurrent


    this.commands = commands;


    const nodes: MenuNodes = {};

    nodes["title"] = { nodetype: schema.nodes.title };
    nodes["paragraph"] = { nodetype: schema.nodes.paragraph };
    nodes["h1"] = { nodetype: schema.nodes.heading, attrs: { level: 1 } };
    nodes["h2"] = { nodetype: schema.nodes.heading, attrs: { level: 2 } };
    nodes["h3"] = { nodetype: schema.nodes.heading, attrs: { level: 3 } };
    nodes["check"] = { nodetype: schema.nodes.check };
    nodes["code_block"] = { nodetype: schema.nodes.code_block };

    nodes["ul"] = { nodetype: schema.nodes.bullet_list };
    nodes["ol"] = { nodetype: schema.nodes.ordered_list };

    this.nodes = nodes;


    const marks: MenuMarks = {};

    marks["bold"] = schema.marks.strong;
    marks["italic"] = schema.marks.em;
    marks["underline"] = schema.marks.ins;
    marks["strikethrough"] = schema.marks.del;
    marks["code"] = schema.marks.code;

    this.marks = marks;


    const commandSets: MenuSets = {};
    for (let key in this.commands) {
      commandSets[key] = (state) => { this.states.value[key].applicable = state }
    }
    this.commandSetters = commandSets;

    const markSetters: MenuSets = {};
    for (let key in this.marks) {
      markSetters[key] = (state) => { this.states.value[key].mark = state }
    }
    this.markSetters = markSetters;

    const nodeSetters: MenuSets = {};
    for (let key in this.nodes) {
      nodeSetters[key] = (state) => { this.states.value[key].node = state }
    }
    this.nodeSetters = nodeSetters;

    const buttons: MenuButtons = ref({});
    this.buttons = buttons;
  };

  createButtons(editorView : EditorView) {
    
    const createNormal = (key: string) => {
      this.buttons.value[key] = () => {
        editorView.focus();
        this.commands[key](editorView.state, editorView.dispatch, editorView);
      }
    };

    const normally = [
      "bold", 
      "italic", 
      "underline", 
      "strikethrough", 
      "code", 
      
      "paragraph", 
      "h1", 
      "h2", 
      "h3", 
      "check",
      "code_block", 

      "ol", 
      "ul", 
      "indent", 
      "outdent",

      "hr",
      "table",
      "columns",

      "t_col_before",
      "t_col_after",
      "t_row_before",
      "t_row_after",
      "t_del_col",
      "t_del_row",
      "t_merge_cell",
      "t_split_cell",
      "t_head_cell",
      "t_head_col",
      "t_head_row",
      "t_cell_forward",
      "t_cell_backward",
      "t_delete",

      "delete"
    ]

    this.buttons.value["pagelink"] = (id: number) => {
      editorView.focus();
      this.cmd.insertPageLink(id)(editorView.state, editorView.dispatch);
    }

    normally.forEach(createNormal);

    for (let color in colors) {
      this.buttons.value["setcolor_" + color] = () => {
        editorView.focus();
        this.cmd.setNodeColor(color)(editorView.state, editorView.dispatch);
      }
    }
  };
}
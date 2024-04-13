import { Commands } from "./commands";

import { EditorView } from "prosemirror-view";
import { ref, type Ref } from "vue";
import { MarkType, NodeType, Schema, type Attrs } from "prosemirror-model";
import type { Command } from "prosemirror-state";

export type MenuCommands = { [id: string]: Command };
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
  mcommands: MenuCommands;
  nodes: MenuNodes;
  marks: MenuMarks;
  mcommandSetters: MenuSets;
  nodeSets: MenuSets;
  markSets: MenuSets;
  buttons: MenuButtons;
  constructor(schema: Schema, commands: Commands) {
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
    states.value["code_block"] = { applicable: true, node: false };
    states.value["ol"] = { applicable: true, node: false };
    states.value["ul"] = { applicable: true, node: false };
    states.value["indent"] = { applicable: true };
    states.value["outdent"] = { applicable: true };

    this.states = states;

    const mcommands: MenuCommands = {};

    mcommands["bold"] = commands.mark.bold;
    mcommands["italic"] = commands.mark.italic;
    mcommands["underline"] = commands.mark.underline;
    mcommands["strikethrough"] = commands.mark.strikethrough;
    mcommands["code"] = commands.mark.code;

    mcommands["paragraph"] = commands.block.paragraph;
    mcommands["h1"] = commands.block.h1;
    mcommands["h2"] = commands.block.h2;
    mcommands["h3"] = commands.block.h3;
    mcommands["code_block"] = commands.block.code;

    mcommands["ul"] = commands.bulletList;
    mcommands["ol"] = commands.orderedList;

    mcommands["indent"] = commands.tab;
    mcommands["outdent"] = commands.shift_tab;

    this.mcommands = mcommands;


    const nodes: MenuNodes = {};

    nodes["title"] = { nodetype: schema.nodes.title };
    nodes["paragraph"] = { nodetype: schema.nodes.paragraph };
    nodes["h1"] = { nodetype: schema.nodes.heading, attrs: { level: 1 } };
    nodes["h2"] = { nodetype: schema.nodes.heading, attrs: { level: 2 } };
    nodes["h3"] = { nodetype: schema.nodes.heading, attrs: { level: 3 } };
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
    for (let key in this.mcommands) {
      commandSets[key] = (state) => { this.states.value[key].applicable = state }
    }
    this.mcommandSetters = commandSets;

    const markSets: MenuSets = {};
    for (let key in this.marks) {
      markSets[key] = (state) => { this.states.value[key].mark = state }
    }
    this.markSets = markSets;

    const nodeSets: MenuSets = {};
    for (let key in this.nodes) {
      nodeSets[key] = (state) => { this.states.value[key].node = state }
    }
    this.nodeSets = nodeSets;

    const buttons: MenuButtons = ref({});
    this.buttons = buttons;
  };

  createButtons(editorView : EditorView) {
    
    const createNormal = (key: string) => {
      this.buttons.value[key] = () => {
        editorView.focus();
        this.mcommands[key](editorView.state, editorView.dispatch, editorView);
      }
    };

    const normally = [
      "bold", 
      "italic", 
      "underline", 
      "paragraph", 
      "strikethrough", 
      "code", 
      "h1", 
      "h2", 
      "h3", 
      "code_block", 
      "ol", 
      "ul", 
      "indent", 
      "outdent"
    ];

    normally.forEach(createNormal);
  };
}
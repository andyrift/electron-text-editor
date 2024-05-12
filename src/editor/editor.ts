import { EditorState, type EditorStateConfig, Plugin } from "prosemirror-state"
import { type DirectEditorProps, EditorView } from "prosemirror-view"

import { Node, Schema } from "prosemirror-model"

import {
  keymapPlugin,
  menuPlugin,
  wordCountPlugin,
  dropCursor,
  hintPlugin,
  tabInterceptPlugin,
  listFixPlugin,
  
  gapCursor,
  tableEditing,
  columnResizing,
  history,

  // in testing
  dragPlugin,
  posPlugin
} from "./plugins"

import { schema } from "./schema"

import { Menu } from "./menu"
import { Commands } from "./commands"

import { TableView } from "prosemirror-tables"

import { DocumentJson, EditorStateJson } from "@src/database/model"

export class Editor {
  plugins: Plugin[]
  schema: Schema
  commands: Commands
  view: EditorView | null = null
  
  // menu: Menu

  private static _instance: Editor

  static getInstance(): Editor {
    if (this._instance) return this._instance
    this._instance = new this()
    return this._instance
  };

  private constructor() {

    if (Editor._instance) throw "Can not create more editors"

    this.schema = schema
    this.commands = new Commands(schema)

    // this.menu = new Menu(schema, this.commands)

    this.plugins = [
      gapCursor(),
      keymapPlugin(this.commands),
      // menuPlugin(this.menu),
      // wordCountPlugin(this.wordCounter),
      dropCursor(),
      // titlePlaceholderPlugin("Untitled"),
      hintPlugin("Write something..."),
      // titleUpdatePlugin(this.emitTitleUpdate),
      // stateUpdatePlugin(this.emitStateUpdate),
      // dragPlugin(),
      listFixPlugin(),
      columnResizing(),
      tableEditing({ allowTableNodeSelection: true }),
      history(),
      tabInterceptPlugin(),
      // posPlugin(this.rectangles),
    ]

    document.execCommand('enableObjectResizing', false, 'false')
    document.execCommand('enableInlineTableEditing', false, 'false')
  };

  createState(doc: Node | null): EditorState {
    const config: EditorStateConfig = {
      schema: this.schema,
      plugins: this.plugins,
    }
    if (doc) config.doc = doc
    return EditorState.create(config)
  };

  createView(element: Element): EditorView {
    const cmd = this.commands

    const props: DirectEditorProps = {
      state: this.createState(null),
      nodeViews: {
        table(node) { return new TableView(node, 40) },
        // check(node, view, getPos) { return new CheckView(node, view, getPos, cmd) },
        // page_link(node, view, getPos) { return new PageLinkView(node, view, getPos, cmd) },
      },
    }

    return new EditorView(element, props)
  };

  getTitle(): string | null {
    if (!this.view) return null;
    let maybeTitle = this.view.state.doc.firstChild;
    if (maybeTitle && maybeTitle.type.name == "title") {
      return maybeTitle.textContent || null;
    }
    return null;
  };

  putPage(document: DocumentJson, editor_state: EditorStateJson): void {
    if (!this.view) return;

    this.view.state = this.createState(this.schema.nodeFromJSON(document));
    this.view.dispatch(this.view.state.tr);
  };

  getPageData(): { document: DocumentJson, editor_state: EditorStateJson } | null {
    if (!this.view) return null
    const state = this.view.state.toJSON()
    return {
      document: state.doc,
      editor_state: {},
    }
  }

  newPageData(): { document: DocumentJson, editor_state: EditorStateJson } {
    const state = this.createState(null).toJSON()
    return {
      document: state.doc,
      editor_state: {},
    }
  }

}
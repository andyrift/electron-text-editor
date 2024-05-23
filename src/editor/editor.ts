import { EditorState, type EditorStateConfig, NodeSelection, Plugin } from "prosemirror-state"
import { type DirectEditorProps, EditorView } from "prosemirror-view"

import { Node, Schema } from "prosemirror-model"

import {
  keymapPlugin,
  menuPlugin,
  // wordCountPlugin,
  dropCursor,
  hintPlugin,
  tabInterceptPlugin,
  listFixPlugin,
  
  gapCursor,
  tableEditing,
  columnResizing,
  history,

  dropPlugin,
  positionPlugin
} from "./plugins"

import { schema } from "./schema"

import { MenuState } from "./menuState"
import { Commands } from "./commands"

import { CheckView, PageLinkView, TableView, TitleView } from "./node-views"

import { DocumentJson, EditorStateJson } from "@src/database/model"
import { PubSub } from "@src/pubSub"
import { PositionState } from "./positionState"

export class Editor {
  private plugins: Plugin[]
  private schema: Schema
  private commands: Commands
  private view: EditorView | null = null

  private menuState: MenuState
  private positionState: PositionState

  private actionPos: number | null = null

  private static _instance: Editor

  static getInstance(): Editor {
    if (this._instance) return this._instance
    this._instance = new this()
    return this._instance
  };

  constructor() {

    if (Editor._instance) throw "Can not create more editors"

    this.schema = schema
    this.commands = new Commands(schema)

    this.menuState = new MenuState(schema, this.commands)
    this.positionState = new PositionState()

    this.plugins = [
      gapCursor(),
      keymapPlugin(this.commands),
      menuPlugin(this.menuState),
      // wordCountPlugin(this.wordCounter),
      dropCursor(),
      // titlePlaceholderPlugin("Untitled"),
      hintPlugin("Write something..."),
      // titleUpdatePlugin(this.emitTitleUpdate),
      // stateUpdatePlugin(this.emitStateUpdate),
      dropPlugin(),
      listFixPlugin(),
      columnResizing(),
      tableEditing({ allowTableNodeSelection: true }),
      history(),
      tabInterceptPlugin(),
      positionPlugin(this.positionState),
    ]

    document.execCommand('enableObjectResizing', false, 'false')
    document.execCommand('enableInlineTableEditing', false, 'false')

    PubSub.subscribe("pagelink-select-page", (pos: number, id: number) => {
      this.actionPos = pos
      this.setEditable(false)
    })

    PubSub.subscribe("browser-select-page", (id: number) => {
      if (this.actionPos !== null && this.view) 
        this.commands.setPageLink(this.actionPos, id)(this.view.state, this.view.dispatch)
      this.actionPos = null
      this.setEditable(true)
    })
  }

  createState(doc: Node | null): EditorState {
    const config: EditorStateConfig = {
      schema: this.schema,
      plugins: this.plugins,
    }
    if (doc) config.doc = doc
    return EditorState.create(config)
  }

  createView(element: HTMLElement): EditorView {
    const cmd = this.commands

    const props: DirectEditorProps = {
      state: this.createState(null),
      nodeViews: {
        table(node) { return new TableView(node, 40) },
        title(node, view, getPos) { return new TitleView(node, view, getPos) },
        check(node, view, getPos) { return new CheckView(node, view, getPos, cmd) },
        page_link(node, view, getPos) { return new PageLinkView(node, view, getPos) },
      },
    }

    return new EditorView(element, props)
  }

  setView(view: EditorView) {
    this.view = view
    this.view.setProps({
      editable: () => false
    })
  }

  getTitle(): string | null {
    if (!this.view) return null
    let maybeTitle = this.view.state.doc.firstChild
    if (maybeTitle && maybeTitle.type.name == "title") {
      return maybeTitle.textContent || null
    }
    return null
  }

  putPage(document: DocumentJson, editor_state: EditorStateJson): void {
    if (!this.view) return

    this.view.state = this.createState(this.schema.nodeFromJSON(document))
    this.view.dispatch(this.view.state.tr)
  }

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

  setEditable(value: boolean): boolean {
    if (!this.view) return false
    this.view.setProps({
      editable: () => value
    })
    return true
  }

  getMenuState() {
    return this.menuState
  }

  getPositionState() {
    return this.positionState
  }

  hasView() {
    return this.view !== null
  }

  focus() {
    this.view?.focus()
  }

  selectNodeAtPos(pos: number) {
    if (this.view !== null)
      this.view.dispatch(this.view.state.tr.setSelection(NodeSelection.create(this.view.state.doc, pos)))
  }

}
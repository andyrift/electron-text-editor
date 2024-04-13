import { EditorState, type EditorStateConfig, Plugin } from "prosemirror-state";
import { type DirectEditorProps, EditorView } from "prosemirror-view";
import { type Ref, onMounted, ref } from "vue";
import type { PageData, Page } from "../pageManager";
import { Node, Schema } from "prosemirror-model";

import {
  keymapPlugin,
  menuPlugin,
  wordCountPlugin,
  dropCursor,
  gapCursor,
  hintPlugin,
  titlePlaceholder,
  titleUpdate,
  tableEditing
} from "./plugins";

import { schema } from "./schema";

import { Menu } from "./menu";
import { Commands } from "./commands";
import { PubSub } from "../pubSub";

export class Editor {
  plugins: Plugin[];
  schema: Schema;
  commands: Commands;
  menu: Menu;
  view: EditorView | null = null;
  pageid: number | null = null;
  wordCounter = ref({ words: 0, characters: 0 });
  
  private titleSubs: Array<(title:string | null) => void> = [];
  private useSubs: Array<() => void> = [];
  private updSubs: Array<() => void> = [];

  private static _instance: Editor;

  static getInstance(): Editor {
    if (this._instance) return this._instance;
    this._instance = new this();
    return this._instance;
  };

  private constructor() {
    this.schema = schema;
    this.commands = new Commands(schema);
    this.menu = new Menu(schema, this.commands);
    this.plugins = [
      keymapPlugin(this.commands),
      menuPlugin(this.menu),
      wordCountPlugin(this.wordCounter),
      dropCursor(),
      gapCursor(),
      hintPlugin("Write something, '/' for commands..."),
      titlePlaceholder("Untitled"),
      titleUpdate(this.emitTitleUpdate),
      tableEditing()
    ];
  };

  private emitTitleUpdate = (title: string | null) => {
    this.titleSubs.forEach(callback => {
      callback(title);
    })
  }

  subscribeToTitleUpdate = (callback: (title: string | null) => void) => {
    this.titleSubs.push(callback);
  };

  subscribeToUseView = (callback: () => void) => {
    this.useSubs.push(callback);
  }

  subscribeToUpdate = (callback: () => void) => {
    this.updSubs.push(callback);
  }

  newState = (doc?: Node) => {
    return EditorState.create({
      schema: this.schema,
      plugins: this.plugins,
      doc
    } as EditorStateConfig);
  };

  private createView = (editor: Element) => {
    const emitUpdate = () => {
      this.updSubs.forEach(callback => {
        callback();
      })
    }
    const view = new EditorView(editor, {
      state: this.newState(),
      dispatchTransaction(transaction) {
        const newState = view.state.apply(transaction);
        view.updateState(newState);
        emitUpdate();
      },
      handleKeyDown(view, event) {
        if (event.key == "Tab") {
          event.preventDefault();
        }
      }
    } as DirectEditorProps);
    return view;
  };

  useView = (editor: Ref<Element | null>) => {
    document.execCommand('enableObjectResizing', false, 'false');
    document.execCommand('enableInlineTableEditing', false, 'false');
    onMounted(() => {
      if (editor.value) {
        this.view = this.createView(editor.value);
        this.useSubs.forEach(callback => {
          callback();
        })
      }
      else throw new Error("No Editor Element Provided");
    });
  };

  getTitle = () => {
    if (!this.view) return null;
    let maybeTitle = this.view.state.doc.firstChild;
    if (maybeTitle && maybeTitle.type == this.schema.nodes.title) {
      return maybeTitle.textContent || null;
    }
    return null;
  };

  putPage = (page: PageData) => {
    if (!this.view) return;
    this.pageid = page.id;
    this.view.state = this.newState(this.schema.nodeFromJSON(page.data.doc));
    this.view.dispatch(this.view.state.tr);
    this.emitTitleUpdate(this.getTitle());
  };

  getPage: () => Page | null = () => {
    if (!this.pageid || !this.view) return null;
    return {
      id: this.pageid,
      data: this.view.state.toJSON(),
      title: this.getTitle()
    }
  };

  emptyPage = () => {
    return this.newState().toJSON();
  };

}
import { EditorState, type EditorStateConfig, Plugin } from "prosemirror-state";
import { type DirectEditorProps, EditorView } from "prosemirror-view";
import { type Ref, onMounted, ref } from "vue";
import type { PageEditor } from "@types";
import { DOMSerializer, Node, Schema } from "prosemirror-model";
import { history } from "prosemirror-history";

import {
  dragPlugin,
  keymapPlugin,
  menuPlugin,
  wordCountPlugin,
  dropCursor,
  gapCursor,
  hintPlugin,
  titlePlaceholderPlugin,
  tableEditing,
  titleUpdatePlugin,
  tabInterceptPlugin,
  stateUpdatePlugin,
  listFixPlugin,
  posPlugin,
} from "./plugins";

import { schema } from "./schema";

import { Menu } from "./menu";
import { Commands } from "./commands";
import { CheckView, PageLinkView } from "./nodeViews";
import { TableView, columnResizing } from "prosemirror-tables";

export class Editor {
  plugins: Plugin[];
  schema: Schema;
  commands: Commands;
  menu: Menu;
  view: EditorView | null = null;
  wordCounter = ref({ words: 0, characters: 0 });
  rectangles = ref<any[]>([])
  private serializer: DOMSerializer;

  private titleSubs: Array<(title: string | null) => void> = [];
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
      gapCursor(),
      keymapPlugin(this.commands),
      menuPlugin(this.menu),
      wordCountPlugin(this.wordCounter),
      dropCursor(),
      titlePlaceholderPlugin("Untitled"),
      hintPlugin("Write something, '/' for commands..."),
      titleUpdatePlugin(this.emitTitleUpdate),
      stateUpdatePlugin(this.emitStateUpdate),
      dragPlugin(),
      listFixPlugin(),
      columnResizing(),
      tableEditing({ allowTableNodeSelection: true }),
      tabInterceptPlugin(),
      history(),
      posPlugin(this.rectangles)
    ];
    this.serializer = DOMSerializer.fromSchema(this.schema);
  };

  private emitTitleUpdate = (title: string | null) => {
    this.titleSubs.forEach(callback => {
      callback(title);
    })
  }

  private emitStateUpdate = () => {
    this.updSubs.forEach(callback => {
      callback();
    })
  }

  private emitUseView() {
    this.useSubs.forEach(callback => {
      callback();
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
    let serializer = this.serializer;
    let cmd = this.commands
    const view = new EditorView(editor, {
      state: this.newState(),
      nodeViews: {
        check(node, view, getPos) { return new CheckView(node, view, getPos, cmd) },
        table(node) { return new TableView(node, 40) },
        page_link(node, view, getPos) { return new PageLinkView(node, view, getPos, cmd) }
        //paragraph(node, view, getPos) { return new ParagraphView(node, view, getPos) },
        //code_block(node, view, getPos) { return new CodeblockView(node, view, getPos) }, 
        //heading(node, view, getPos) { return new HeadingView(node, view, getPos) },
        //table(node, view, getPos) { return new TableView(node, view, getPos) },
      },
    } as DirectEditorProps);
    return view;
  };

  useView = (editor: Ref<Element | null>) => {
    document.execCommand('enableObjectResizing', false, 'false');
    document.execCommand('enableInlineTableEditing', false, 'false');
    onMounted(() => {
      if (editor.value) {
        this.view = this.createView(editor.value);
        this.emitUseView();
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

  putPage = (data: any) => {
    if (!this.view) return;
    this.view.state = this.newState(this.schema.nodeFromJSON(data.doc));
    this.view.dispatch(this.view.state.tr);
    this.emitTitleUpdate(this.getTitle());
  };

  getPage: () => PageEditor | null = () => {
    if (!this.view) return null;
    return {
      data: this.view.state.toJSON(),
      title: this.getTitle(),
    }
  };

  emptyPage = () => {
    return this.newState().toJSON();
  };

}
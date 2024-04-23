import { DOMSerializer, Node } from "prosemirror-model"
import { EditorView, NodeView } from "prosemirror-view"
import { codeblockDOM, columnlistDOM, headingDOM, paragraphDOM } from "./schema/nodes";
import { NodeSelection, TextSelection } from "prosemirror-state";

import { Core, PageManager, PubSub, colors } from "@core";
import { Commands } from "./commands";

export class CheckView implements NodeView {
  dom: HTMLElement;
  contentDOM: HTMLElement;
  
  node: Node;
  view: EditorView;
  getPos: () => number | undefined;

  check: string;
  bgcolor: string;
  constructor(node: Node, view: EditorView, getPos: () => number | undefined, cmd: Commands) {
    this.check = node.attrs.check;
    this.bgcolor = node.attrs.bgcolor;
    this.node = node;
    this.view = view;
    this.getPos = getPos;

    this.dom = document.createElement("check");
    this.contentDOM = document.createElement("div");

    this.dom.classList.add(..."my-1 text-base bg-opacity-30 block".split(' '));
    this.dom.classList.add('bg-' + colors[this.bgcolor].class);

    let icon = document.createElement('i');
    icon.classList.add(..."ml-0.5 mr-1.5 text-md inline-block cursor-pointer align-top mt-1 h-fit".split(' '));
    icon.style.zIndex = '3'

    this.contentDOM.classList.add(...'inline-block'.split(' '))

    if (this.check == 'true') {
      icon.classList.add("fa-solid")
      icon.classList.add("fa-square-check")
      icon.classList.add("text-blue-500")

      this.contentDOM.classList.add('text-gray-500')
      this.contentDOM.classList.add('line-through')
    } else if (this.check == 'false') {
      icon.classList.add("fa-regular")
      icon.classList.add("fa-square")
      icon.classList.add("text-gray-500")
    }

    icon.addEventListener('mousedown', (e) => {
      e.stopPropagation()
      e.preventDefault()
      let pos = getPos()
      if (pos) cmd.toggleCheck(pos)(view.state, view.dispatch)
    })

    this.dom.appendChild(icon);
    this.dom.appendChild(this.contentDOM);
  }
}

export class PageLinkView implements NodeView {
  dom: HTMLElement;

  node: Node;
  view: EditorView;
  getPos: () => number | undefined;

  id: number;
  bgcolor: string;
  constructor(node: Node, view: EditorView, getPos: () => number | undefined, cmd: Commands) {
    this.id = node.attrs.id;
    this.bgcolor = node.attrs.bgcolor;
    this.node = node;
    this.view = view;
    this.getPos = getPos;

    this.dom = document.createElement("pagelink");

    this.dom.classList.add(..."my-1 text-base bg-opacity-30 block text-gray-800".split(' '));
    this.dom.classList.add('bg-' + colors[this.bgcolor].class);

    let icon = document.createElement('i');
    icon.classList.add(..."fa-solid fa-file-lines inline ml-0.5 cursor-pointer mr-1.5 text-md my-1 h-fit".split(' '));

    let page = document.createElement('div')
    page.classList.add(..."cursor-pointer inline hover:underline".split(' '));
    if(this.id) {
      let pageitm = PageManager.getInstance().pagesDict.value.get(this.id)
      if (pageitm) {
        if (pageitm.title) page.innerText = pageitm.title
        else page.innerText = "Untitled"
        if (pageitm.deleted) page.classList.add(..."line-through text-gray-500".split(' '));
      } else {
        page.innerText = "Error"
      }
    } else {
      page.innerText = "Select Page"
      page.classList.add("text-gray-500");
    }

    
    this.dom.appendChild(icon);
    this.dom.appendChild(page);

    const handler = (e: MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      if (this.id) {
        Core.getInstance().openPage(this.id)
      } else {
        let pos = getPos()
        if (pos) PubSub.getInstance().emit('select-page-link', pos, this.id)
      }
    }

    icon.addEventListener('click', (e: MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      let pos = getPos()
      if (pos) PubSub.getInstance().emit('select-page-link', pos, this.id)
    })
    page.addEventListener('click', handler)
  }
}
/*
class ContentView implements NodeView {
  dom;
  contentDOM?: HTMLElement | null | undefined;
  square: HTMLElement;
  constructor(dom: HTMLElement, contentDOM: HTMLElement | null | undefined, node: Node, view: EditorView, getPos: () => number | undefined) {
    this.dom = dom;

    this.contentDOM = contentDOM;
    let pos = getPos();
    this.square = document.createElement("div");
    if (pos) {
      let resolved = view.state.doc.resolve(pos);
      let before = resolved.depth > 0 && view.state.doc.resolve(resolved.before(resolved.depth));
      if (resolved.parent.type != view.state.schema.nodes.list_item) {

        this.square.classList.add(..."p-2 rounded absolute bg-gray-600 opacity-50 cursor-pointer".split(' '));
        this.square.style.left = "-20px"
        this.square.style.top = "4px"
        this.square.style.zIndex = "10"
        this.square.contentEditable = "false";
        this.square.draggable = true;

        this.dom.appendChild(this.square);

        this.square.addEventListener('mousedown', (e) => {
          let pos = getPos()
          if (pos) view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, pos)));
        })

        this.square.addEventListener('dragstart', (e) => {
          let pos = getPos()
          if (pos) view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, pos)));
        })
      }
    }
  }
}

export class ParagraphView extends ContentView {
  constructor(node: Node, view: EditorView, getPos: () => number | undefined) {
    let dom = document.createElement('div');
    dom.classList.add(..."relative mt-1".split(' '));
    let contentDOM = document.createElement(paragraphDOM(node)[0]);
    dom.appendChild(contentDOM);
    super(dom, contentDOM, node, view, getPos);
  }
}

export class CodeblockView extends ContentView {
  constructor(node: Node, view: EditorView, getPos: () => number | undefined) {
    let dom = document.createElement('div');
    dom.classList.add(..."relative".split(' '));
    let contentDOM = document.createElement(codeblockDOM[0]);
    contentDOM.classList.add(...codeblockDOM[1].class.split(' '));
    dom.appendChild(contentDOM);
    super(dom, contentDOM, node, view, getPos);
  }
}

export class HeadingView extends ContentView {
  constructor(node: Node, view: EditorView, getPos: () => number | undefined) {
    let dom = document.createElement('div');
    dom.classList.add(..."relative".split(' '));

    let hdom = headingDOM(node);
    let contentDOM = document.createElement(hdom[0]);
    contentDOM.classList.add(...hdom[1].class.split(' '));
    dom.appendChild(contentDOM);
    super(dom, contentDOM, node, view, getPos);
  }
}

export class TableView extends ContentView {
  constructor(node: Node, view: EditorView, getPos: () => number | undefined) {
    let dom = document.createElement('div');
    dom.classList.add(..."relative".split(' '));
    let contentDOM = document.createElement('tbody');
    let table = document.createElement('table');
    dom.appendChild(table);
    table.appendChild(contentDOM);
    super(dom, contentDOM, node, view, getPos);
  }
}
*/
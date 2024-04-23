import { Node } from "prosemirror-model";
import { NodeSelection, Plugin, PluginKey, TextSelection } from "prosemirror-state";
import { Decoration, DecorationSet, EditorView } from "prosemirror-view";
import { Ref } from "vue";

export const statePlugin = () => {
  return new Plugin({
    key: new PluginKey("state plugin"),
    state: {
      init: (config, instance) => {
        console.log("state plugin init");
      },
      apply: (tr, value, oldState, newState) => {
        console.log("state plugin apply");
      }
    }
  })
}

export const viewPlugin = () => {
  return new Plugin({
    key: new PluginKey("view plugin"),
    view: (view) => {
      console.log("view plugin init");
      return {
        update: (view, prevState) => {
          console.log("view plugin update");
        },
        destroy: () => {
          console.log("view plugin destroy");
        }
      }
    }
  })
}

export const outlinePlugin = () => {
  return new Plugin({
    props: {
      decorations(state) {
        const selection = state.selection;
        const decorations: Decoration[] = [];

        state.doc.nodesBetween(selection.from, selection.to, (node, position) => {
          if (node.isBlock) {
            decorations.push(Decoration.node(position, position + node.nodeSize, { class: 'shadow' }));
          }
        });

        return DecorationSet.create(state.doc, decorations);
      }
    }
  })
}

export const idPlugin = (idStore : { lastId : number}) => {
  return new Plugin({
    appendTransaction: (transactions, oldState, newState) => {
      let tr = newState.tr;
      newState.doc.descendants((node, pos) => {
        if (node.type.spec.attrs && "id" in node.type.spec.attrs) {
          if (node.attrs.id === null) {
            idStore.lastId += 1;
            console.log("Set id of", node.type.name, "to", idStore.lastId);
            tr.setNodeAttribute(pos, "id", idStore.lastId);
          }
        }
      });
      return tr;
    }
  })
}

export const placeholderPlugin = (titleText: string, paragraphText: string) => {
  return new Plugin({
    props: {
      decorations(state) {
        const decorations = [] as Decoration[];

        const decorate = (node: Node, pos: number) => {
          if (
            node.type.isBlock && 
            (node.type == state.schema.nodes.title ||
              node.type == state.schema.nodes.paragraph && state.selection.$anchor.parent == node) &&
            node.childCount === 0) {

            let placeholder = document.createElement("span");

            if (node.type == state.schema.nodes.title) {
              placeholder.classList.add(..."title text-5xl font-bold".split(' '));
              placeholder.setAttribute('placeholder', titleText);
            } else if (node.type == state.schema.nodes.paragraph) {
              placeholder.classList.add(..."paragraph".split(' '));
              placeholder.setAttribute('placeholder', paragraphText);
            } 
            
            decorations.push(
              Decoration.widget(pos, placeholder)
            )
          }
        }

        state.doc.descendants(decorate)

        return DecorationSet.create(state.doc, decorations)
      },
    },
  })
}

export const oldDragPlugin = () => {
  return new Plugin({
    props: {
      handleDrop(view, e, slice) {
        if (e.dataTransfer) {
          let posString = e.dataTransfer.getData('pos');
          if (posString) {
            let pos = parseInt(posString)
            if (pos) {
              let droppos = view.posAtCoords({ left: e.clientX, top: e.clientY })
              let node = view.state.doc.nodeAt(pos);
              if (droppos && node) {
                let tr = view.state.tr
                tr.setSelection(NodeSelection.create(tr.doc, pos))
                tr.deleteSelection()
                let drop = tr.mapping.map(droppos.pos)
                tr.insert(drop, node)
                if (tr.doc.nodeAt(drop)) {
                  tr.setSelection(NodeSelection.create(tr.doc, drop))
                } else {
                  tr.setSelection(NodeSelection.create(tr.doc, drop + 1))
                }
                view.dispatch(tr)
                return true
              }
            }
          }
        }
      },

      handleClick: (view, pos, e) => {
        if (e.target instanceof HTMLElement) {
          let posString = e.target.getAttribute('pos');
          if (posString) {
            e.preventDefault()
            let pos = parseInt(posString)
            if (pos) {
              console.log('click')
              view.focus()
              view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, pos)))
              return true
            }
          }
        }
        return false
      },
      
      handleDOMEvents: {
        "mousedown": (view, e) => {
          if (e.target instanceof HTMLElement) {
            let posString = e.target.getAttribute('pos');
            if (posString) {
              let pos = parseInt(posString)
              if (pos) {
                view.focus()
                view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, pos)))
                //return true
              }
            }
          }
          return false
        },
        "dragstart": (view, e) => {
          if (e.target instanceof HTMLElement){
            let posString = e.target.getAttribute('pos');
            if (posString) {
              if (e.dataTransfer) {
                e.dataTransfer.setData('pos', posString);
                let pos = parseInt(posString)
                if (pos) {
                  return true;
                }
              }
            }
          }
        }
      },
      decorations(state) {
        const decorations = [] as Decoration[];

        const decorate = (node: Node, pos: number) => {
          let types = [
            state.schema.nodes.paragraph,
            state.schema.nodes.heading,
            state.schema.nodes.column_list,
            state.schema.nodes.table,
            state.schema.nodes.code_block,
            state.schema.nodes.list_item,
            state.schema.nodes.bullet_list,
            state.schema.nodes.ordered_list,
            state.schema.nodes.horizontal_rule,
            state.schema.nodes.check,
            state.schema.nodes.blockquote,
            state.schema.nodes.page_link
          ]
          
          if (types.includes(node.type)) {
            if (state.doc.resolve(pos).parent.type == state.schema.nodes.list_item) {
              if (state.doc.resolve(pos).nodeBefore?.type != state.schema.nodes.paragraph) {
                return
              }
            }

            let square = document.createElement("div");
            square.classList.add(..."absolute h-4 w-4 rounded bg-gray-600 opacity-50 cursor-pointer".split(' '));
            //square.style.left = "-20px"
            //square.style.top = "4px"
            square.style.zIndex = "5"
            //square.style.width = "10px"
            //square.style.height = "10px"
            square.style.transform = "translate(-18px, 4px)"
            if (node.type == state.schema.nodes.table) {
              square.style.transform = "translate(-30px, 4px)"
            }
            if (node.type == state.schema.nodes.column_list) {
              square.style.transform = "translate(-36px, 4px)"
            }
            if (node.type == state.schema.nodes.bullet_list) {
              square.style.transform = "translate(-36px, 4px)"
            }
            square.style.display = "block"
            square.draggable = true;
            square.setAttribute('pos', pos.toString());

            decorations.push(
              Decoration.widget(pos, square)
            )
          }
        }

        state.doc.descendants(decorate)

        return DecorationSet.create(state.doc, decorations)
      },
    },
  })
}

export const dragPlugin = () => {
  return new Plugin({
    props: {
      handleDrop(view, e, slice) {
        if (e.dataTransfer) {
          let posString = e.dataTransfer.getData('pos');
          if (posString) {
            let pos = parseInt(posString)
            if (pos) {
              let droppos = view.posAtCoords({ left: e.clientX, top: e.clientY })
              let node = view.state.doc.nodeAt(pos);
              if (droppos && node) {
                let tr = view.state.tr
                tr.setSelection(NodeSelection.create(tr.doc, pos))
                tr.deleteSelection()
                let drop = tr.mapping.map(droppos.pos)
                if (tr.doc.resolve(drop).parent.inlineContent) {
                  drop = tr.doc.resolve(drop).after()
                }
                // TODO Check if dropping into a list
                let lists = [
                  "ordered_list",
                  "bullet_list"
                ]
                let resolved = tr.doc.resolve(drop);
                if (resolved.parent.type.name=="list_item") {
                  if (resolved.start() == resolved.pos) {
                    drop -= 1
                  }
                  else if (resolved.end() == resolved.pos) {
                    drop += 1
                  }
                }
                else if (lists.includes(tr.doc.resolve(drop - 1).parent.type.name)) {
                  drop -= 1
                }
                
                let parent = tr.doc.resolve(drop).parent.type
                if (lists.includes(parent.name) && node.type.name != "list_item") {
                  node = view.state.schema.nodes.list_item.create(null, node)
                }
                tr.insert(drop, node)
                if (tr.doc.nodeAt(drop)) {
                  tr.setSelection(NodeSelection.create(tr.doc, drop))
                } else {
                  tr.setSelection(NodeSelection.create(tr.doc, drop + 1))
                }
                view.dispatch(tr)
                view.focus()
                return true
              }
            }
          }
        }
      }
    }
  })
}

export const posPlugin = (rectanglesRef: Ref<any>) => {
  return new Plugin({
    view: (view) => {
      let ignore = [
        'text',
        'column',
        'table_cell',
        'hard_break',
        'table_header',
        'table_row',
        'title',
        'list_item'
      ]
      return {
        update: (view, prevState) => {
          let items: any[] = []
          view.state.doc.descendants((node, pos) => {
            if (ignore.includes(node.type.name)) return;
            /*
            if (view.state.doc.resolve(pos).parent.type.name == "list_item") {
              if (view.state.doc.resolve(pos).nodeBefore?.type.name != "paragraph" &&
                view.state.doc.resolve(pos).parent.childCount == 1) {
                return
              }
            }
            if (node.childCount > 1 && node.type.name == "list_item") return*/
            let coords = view.coordsAtPos(pos);
            let dom = view.nodeDOM(pos)
            let type = node.type.name;
            let item = {
              pos,
              coords,
              dom,
              type
            }
            items.push(item)
          })
          let rectangles: any[] = []
          items.forEach(item => {
            let left = item.coords.left;
            let top = item.coords.top;
            let height = item.dom.clientHeight
            let width = item.dom.clientWidth
            let only_top = [
              "column_list",
              "table",
              "ordered_list",
              "bullet_list"
            ]
            if (only_top.includes(item.type)) {
              height = 24;
            }
            if (item.type == "table") {
              let offset = 12
              left -= offset;
              width += offset;
            }
            if (item.type == "column_list") {
              let offset = 12
              left -= offset;
              width += offset;
              height = 32;
            }
            rectangles.push({ pos: item.pos, left, top, width, height  });
          })
          rectanglesRef.value = rectangles
        }
      }
    }
  })
}
import { Node } from "prosemirror-model";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet, EditorView } from "prosemirror-view";

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

const idPlugin = (idStore : { lastId : number}) => {
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

export const titleUpdate = (callback: (title: string | null) => void) => {
  return new Plugin({
    view: () => {
      return {
        update: (view, prevState) => {
          if (view.state.doc.firstChild && prevState.doc.firstChild) {
            if (view.state.doc.firstChild.textContent != prevState.doc.firstChild.textContent) {
              callback(view.state.doc.firstChild.textContent);
            }
          }
        }
      }
    }
  })
}

import { Node } from "prosemirror-model";
import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

export const hintPlugin = (text: string) => {
  return new Plugin({
    props: {
      decorations(state) {
        const decorations = [] as Decoration[];

        const decorate = (node: Node, pos: number) => {
          let flag = true;
          state.doc.nodesBetween(state.selection.$anchor.start(), state.selection.$anchor.end(), node => {
            if (node.type == state.schema.nodes.table) flag = false;
          })
          if (
            node.type == state.schema.nodes.paragraph && 
            state.selection.$anchor.parent == node &&
            state.selection.empty && flag &&
            node.childCount === 0) {

            let placeholder = document.createElement("span");
            placeholder.setAttribute('placeholder', text);
            placeholder.classList.add(..."paragraph".split(' '));
            
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
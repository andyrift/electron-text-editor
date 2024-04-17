import { Node } from "prosemirror-model";
import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

export const hintPlugin = (text: string) => {
  return new Plugin({
    props: {
      decorations(state) {
        const decorations = [] as Decoration[];

        const decorate = (node: Node, pos: number) => {
          if (state.selection.empty && node.type == state.schema.nodes.paragraph && 
            node.childCount === 0 && state.selection.$from.pos == pos + 1) {

            let placeholder = document.createElement("span");
            placeholder.setAttribute('placeholder', text);
            placeholder.classList.add(..."whitespace-nowrap text-ellipsis overflow-hidden".split(' '));
            
            decorations.push(Decoration.widget(pos+1, placeholder))

            return false;
          }
        }

        state.doc.descendants(decorate)

        return DecorationSet.create(state.doc, decorations)
      },
    },
  })
}
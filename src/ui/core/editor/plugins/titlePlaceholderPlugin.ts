import { Node } from "prosemirror-model";
import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

export const titlePlaceholderPlugin = (text: string) => {
  return new Plugin({
    props: {
      decorations(state) {
        const decorations = [] as Decoration[];

        const decorate = (node: Node, pos: number) => {
          if (node.type == state.schema.nodes.title && node.childCount === 0) {

            let placeholder = document.createElement("span");
            placeholder.setAttribute('placeholder', text);
            placeholder.classList.add(..."title text-4xl font-bold".split(' '));

            decorations.push(
              Decoration.widget(pos+1, placeholder)
            )
          }
        }

        state.doc.descendants(decorate)

        return DecorationSet.create(state.doc, decorations)
      },
    },
  })
}
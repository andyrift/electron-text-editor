import { Plugin } from "prosemirror-state"

export const tabInterceptPlugin = () => {
  return new Plugin({
    props: {
      handleKeyDown(view, event) {
        if (event.key == "Tab") {
          event.preventDefault();
        }
      }
    }
  })
}

export const listFixPlugin = () => {
  return new Plugin({
    appendTransaction: (transactions, oldState, state) => {
      let tr = state.tr;
      let poss: number[] = []
      state.doc.descendants((node, pos) => {
        if (node.type.name == "bullet_list") {
          if (state.doc.resolve(pos).nodeBefore?.type.name == "bullet_list")
            poss.push(pos)
        }
      });
      if (poss.length == 0) return
      poss.forEach(pos => {
        tr = tr.join(tr.mapping.map(pos))
      })
      return tr;
    }
  })
}
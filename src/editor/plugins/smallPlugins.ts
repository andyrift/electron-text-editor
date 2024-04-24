import { Plugin } from "prosemirror-state";

export const stateUpdatePlugin = (callback: () => void) => {
  return new Plugin({
    view: () => {
      return {
        update: () => {
          callback();
        }
      }
    }
  })
}

export const titleUpdatePlugin = (callback: (title: string | null) => void) => {
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
        if (node.type == state.schema.nodes.bullet_list) {
          if (state.doc.resolve(pos).nodeBefore?.type == state.schema.nodes.bullet_list)
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

export const addParagraphPlugin = () => {
  return new Plugin({
    appendTransaction: (transactions, oldState, state) => {
      let tr = state.tr;
      let poss: number[] = []
      state.doc.descendants((node, pos) => {
        if (node.type.name == "column_list") {
          return
        } else if (node.type.name == "column") {
          if (node.lastChild && node.lastChild.type.name != "paragraph") {
            //poss.push(pos + 1 + node.content.size)
          }
          return false
        }
        return false
      });
      if (tr.doc.lastChild && tr.doc.lastChild.type.name != "paragraph")
        poss.push(tr.doc.content.size)

      if (poss.length == 0) return

      poss.forEach(pos => {
        tr.insert(tr.mapping.map(pos), state.schema.nodes.paragraph.create())
      })
      return tr;
    }
  })
}
import { Node } from "prosemirror-model";
import { NodeSelection, Plugin, PluginKey, TextSelection } from "prosemirror-state";
import { Decoration, DecorationSet, EditorView } from "prosemirror-view";

export const dropPlugin = () => {
  return new Plugin({
    props: {
      handleDrop(view, e) {
        if (!e.dataTransfer) return

        const posString = e.dataTransfer.getData('drag-target-node-pos')
        if (!posString) return

        const pos = parseInt(posString)
        if (!pos) return

        const droppos = view.posAtCoords({ left: e.clientX, top: e.clientY })
        const target = view.state.doc.nodeAt(pos)

        if (droppos && target) {
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
          if (resolved.parent.type.name == "list_item") {
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

          var node = target

          if (lists.includes(parent.name) && target.type.name != "list_item") {
            node = view.state.schema.nodes["list_item"]!.create(null, node)
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
        return
      }
    }
  })
}
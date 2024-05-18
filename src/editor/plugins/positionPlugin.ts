import { Plugin } from "prosemirror-state"
import { Ref } from "vue"

export const positionPlugin = (rectanglesRef: Ref<any>) => {
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
            rectangles.push({ pos: item.pos, left, top, width, height });
          })
          rectanglesRef.value = rectangles
        }
      }
    }
  })
}
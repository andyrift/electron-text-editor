import { Plugin } from "prosemirror-state"

export type Position = {
  pos: number
  left: number
  top: number
  width: number
  height: number
}

export interface IPositionState {
  setPositions(positions: Position[]): void
}

export const positionPlugin = (positionState: IPositionState) => {
  return new Plugin({
    view: () => {
      const ignore = [
        'text',
        'column',
        'table_cell',
        'hard_break',
        'table_header',
        'table_row',
        'title',
        'list_item'
      ]
      const only_top = [
        "column_list",
        "table",
        "ordered_list",
        "bullet_list"
      ]
      const item_height = 24
      const horizontal_offset = 12
      return {
        update: (view) => {
          const positions: Position[] = []
          view.state.doc.descendants((node, pos) => {
            if (ignore.includes(node.type.name)) return
            const dom = view.nodeDOM(pos) as HTMLElement
            if (!dom) return
            
            const coords = view.coordsAtPos(pos)
            const type = node.type.name

            let left = coords.left
            let top = coords.top
            let height = dom.clientHeight
            let width = dom.clientWidth
            if (only_top.includes(type)) {
              height = item_height
            }
            if (type == "table") {
              left -= horizontal_offset
              width += horizontal_offset
            }
            if (type == "column_list") {
              left -= horizontal_offset
              width += horizontal_offset
              height = 32
            }
            positions.push({ pos, left, top, width, height })
          })
          positionState.setPositions(positions)
        }
      }
    }
  })
}
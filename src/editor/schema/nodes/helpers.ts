import { colors } from '../../colors'
import { Node } from 'prosemirror-model'

export const mergeClasses = (left: string, right: string): string => {
  if (!left) return right
  if (!right) return left
  if (left && right) return left + ' ' + right
  return ''
}

export const matchColor = (node: Node): string => {
  let color = colors[node.attrs.bgcolor]
  if (color) return 'bg-' + color.class
  return ''
}

export const matchHeading = (node: Node): string => {
  switch (node.attrs.level) {
    case (1):
      return "text-3xl mt-8 mb-3"
    case (2):
      return "text-2xl mt-6 mb-2"
    case (3):
      return "text-xl mt-4 mb-1"
    default: return ""
  }
}
type Color = {
  name: string, 
  class: string
}

export const colors : { [id: string] : Color } = {
  'none': {
    name: "Default",
    class: "transparent"
  },
  'red': {
    name: "Red",
    class: "red-300"
  },
  'orange': {
    name: "Orange",
    class: "orange-300"
  },
  'yellow': {
    name: "Yellow",
    class: "yellow-300"
  },
  'green': {
    name: "Green",
    class: "green-300"
  },
  'cyan': {
    name: "Cyan",
    class: "cyan-300"
  },
  'blue': {
    name: "Blue",
    class: "blue-300"
  },
  'purple': {
    name: "Purple",
    class: "purple-300"
  },
  'pink': {
    name: "Pink",
    class: "pink-300"
  },
  'gray': {
    name: "Gray",
    class: "gray-300"
  },
}
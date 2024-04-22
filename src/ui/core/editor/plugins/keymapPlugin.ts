import { keymap } from "prosemirror-keymap"
import {
  Commands
} from "../commands"

const buildKeymap = (cmd: Commands) => {

  const myKeymap = {
    "Enter": cmd.enter,
    "Mod-Enter": cmd.ctrl_enter,
    "Shift-Enter": cmd.ctrl_enter,
    "Backspace": cmd.backspace,
    "Mod-Backspace": cmd.backspace,
    "Shift-Backspace": cmd.backspace,
    "Delete": cmd.del,
    "Mod-Delete": cmd.del,
    "Mod-a": cmd.selectAll,
    "Mod-A": cmd.selectAll,
    "Mod-Alt-a": cmd.selectSteps,
    "Shift-Ctrl-8": cmd.bulletList,
    "Shift-Ctrl-9": cmd.orderedList,
    "Mod-_": cmd.horizontalRule,
    "Mod->": cmd.blockquote,
    "Tab": cmd.tab,
    "Mod-]": cmd.tab,
    "Shift-Tab": cmd.shift_tab,
    "Mod-[": cmd.shift_tab,

    "Mod-1": cmd.setNodeColor('none'),
    "Mod-2": cmd.setNodeColor('red'),
    "Mod-3": cmd.setNodeColor('green'),
    "Mod-4": cmd.setNodeColor('blue'),

    "Mod-b": cmd.mark.bold,
    "Mod-B": cmd.mark.bold,
    "Mod-i": cmd.mark.italic,
    "Mod-I": cmd.mark.italic,
    "Mod-u": cmd.mark.underline,
    "Mod-U": cmd.mark.underline,
    "Mod-Shift-x": cmd.mark.strikethrough,
    "Mod-Shift-X": cmd.mark.strikethrough,
    "Mod-Shift-s": cmd.mark.strikethrough,
    "Mod-Shift-S": cmd.mark.strikethrough,
    "Mod-e": cmd.mark.code,
    "Mod-E": cmd.mark.code,

    "Mod-Alt-0": cmd.block.paragraph,
    "Mod-Alt-1": cmd.block.h1,
    "Mod-Alt-2": cmd.block.h2,
    "Mod-Alt-3": cmd.block.h3,
    "Shift-Ctrl-\\": cmd.block.code,
    "Ctrl-z": cmd.undo,
    "Ctrl-Alt-z": cmd.redo,
  }

  return keymap(myKeymap);
}


export const keymapPlugin = buildKeymap;
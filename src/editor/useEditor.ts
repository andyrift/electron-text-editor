import { PubSub } from "@src/pubSub";
import { Editor } from "./editor";

import type { Ref } from "vue";
import { onMounted } from "vue";

export function useEditor(element: Ref<Element | null>): Editor {
  const pubSub = PubSub.getInstance()
  const editor = Editor.getInstance()
  
  onMounted(() => {
    if (element.value) {
      editor.view = editor.createView(element.value)
      pubSub.emit("use-editor")
    }
    else throw new Error("No Editor Element Provided")
  });

  return editor
};
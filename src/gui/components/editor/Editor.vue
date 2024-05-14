<template>
  <div ref="relative" class="max-w-3xl h-full mx-auto relative" @contextmenu="handleContextMenu">
    <div class="p-4 mt-8">
      <div ref="editorElement"></div>
      <div class="h-64 cursor-text" @click="handleClickUnderEditor"></div>
    </div>
  </div>
  <Menu :menuState="editor.menuState"></Menu>
</template>

<script setup lang="ts">

import { PubSub } from "@src/pubSub"
import { useEditor } from "@src/editor"
import Menu from "./menu/Menu.vue";

import { ref } from "vue"

const editorElement = ref<HTMLElement | null>(null)
const editor = useEditor(editorElement)

const pubSub = PubSub.getInstance()

async function handleContextMenu (e: MouseEvent) {
  e.preventDefault()
  pubSub.emit("toggle-editor-context-menu", true, e)
}

function handleClickUnderEditor() {
  pubSub.emit("click-under-editor")
}

</script>
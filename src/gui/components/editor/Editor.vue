<template>
  <div ref="relative" class="max-w-3xl mx-auto relative" @contextmenu="handleContextMenu">
    <div ref="editorElement" class="border p-4 relative"></div>
  </div>
  <Menu :menuState="editor.menuState"></Menu>
</template>

<script setup lang="ts">

import { PubSub } from "@src/pubSub"
import { useEditor } from "@src/editor"
import Menu from "./menu/Menu.vue";

import { ref } from "vue"

const editorElement = ref<Element | null>(null)
const editor = useEditor(editorElement)

const pubSub = PubSub.getInstance()

async function handleContextMenu (e: MouseEvent) {
  e.preventDefault()
  pubSub.emit('toggle-editor-context-menu', true, e)
}

</script>
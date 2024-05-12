<template>
  <div ref="relative" class="max-w-3xl mx-auto relative" @contextmenu="handleContextMenu">
    <div ref="editorElement" class="border my-3 p-4 relative"></div>
  </div>
</template>

<script setup lang="ts">

import { PubSub } from "@src/pubSub";
import { useEditor } from "@src/editor";

import { ref } from "vue";

const editorElement = ref<Element | null>(null);
const editor = useEditor(editorElement);

const pubSub = PubSub.getInstance();

const handleContextMenu = async (e: MouseEvent) => {
  e.preventDefault();
  pubSub.emit('editor-context-menu', e);
}

</script>
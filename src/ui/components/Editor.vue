<template>
  <div class="max-w-3xl mx-auto" @contextmenu="contextmenu">
    <div ref="editorEl" class="border my-3 p-4"></div>
  </div>
  <ToolMenu />
</template>

<script setup lang="ts">

import { PubSub, Editor } from "@core";
import { ToolMenu } from "@components";

import { ref } from "vue";
const editor = Editor.getInstance();
const pubSub = PubSub.getInstance();

const editorEl = ref<Element | null>(null);
editor.useView(editorEl);

const contextmenu = async (e: MouseEvent) => {
  e.preventDefault();
  pubSub.emit('editor-context', e);
}

</script>

<style>
.fadetool-enter-active,
.fadetool-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fadetool-enter-from,
.fadetool-leave-to {
  opacity: 0;
  transform: scale(0.99);
}
</style>
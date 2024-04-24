<template>
  <Veil :show="show" :callback="() => {show = false}"></Veil>
  <Transition name="fadequick">
    <div :style="style" v-show=show ref="container" class="fixed text-sm right-0 z-20 bg-white p-1 shadow-unilg mt-2 rounded-md border border-gray-300 w-fit select-none max-h-64 max-w-64 overflow-y-auto">
      <div v-for="page in pageManager.pages.value":key="page.id"
        class="py-1 px-2 text-ellipsis overflow-hidden hover:bg-gray-200 rounded cursor-pointer"
        :class="page.id == currentId ? 'bg-gray-200' : ''"
        @click="setLink(page.id)">
        <i class="fa-solid fa-file-lines mr-2"></i><span>{{ page.title || "Untitled" }}</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { PubSub } from "@src/pubSub";
import { Editor } from "@editor";
import { PageManager } from "@renderer/state-manager/pageManager";

import { ref, computed, nextTick } from "vue";
import Veil from "./Veil.vue";

const editor = Editor.getInstance();
const pubSub = PubSub.getInstance();
const pageManager = PageManager.getInstance();

const left = ref(0);
const top = ref(0);

const style = computed(() => {
  return {
    top: top.value + 'px',
    left: left.value + 'px',
  };
});

const show = ref(false)

let pos : number | null = null
let currentId = ref<number | null>(null)

let container = ref()

pubSub.subscribe('select-page-link', async (p: number, id: number) => {
  if (!editor.view) return
  show.value = true
  pos = p
  currentId.value = id
  let coords = editor.view.coordsAtPos(pos)
  await nextTick()
  if (!container.value) return
  left.value = coords.left
  top.value = coords.top + 20
  if (top.value + container.value.clientHeight > document.body.clientHeight) {
    top.value = coords.top - 20 - container.value.clientHeight
  }
})

editor.subscribeToUpdate(() => {
  show.value = false
})

const setLink = (id: number) => {
  show.value = false
  if(!pos) return
  if (!editor.view) return
  editor.commands.setPageLink(pos, id)(editor.view.state, editor.view.dispatch)
}
</script>
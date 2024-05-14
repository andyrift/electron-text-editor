<template>
  <div class="w-full h-8 bg-white flex items-center px-3 flex-none whitespace-nowrap">
    <div class="grow flex-1">
      <div v-show="last_saved.length" class="text-zinc-400 px-2 text-xs">{{ "Last Saved: " + last_saved }}</div>
    </div>
    <div>{{ title || "Untitled" }}</div>
    <div class="grow flex-1 flex">
      <div class="grow"></div>
      <button class="hover:bg-zinc-200 rounded outline-none mr-1" @click="handleToggleMenu">
        <i class="fa-solid fa-bars px-2 py-1"></i>
      </button>
    </div>
    <Menu></Menu>
  </div>
</template>

<script setup lang="ts">
import Menu from "./Menu.vue"

import { ref } from "vue"
import { PubSub } from "@src/pubSub"
const pubSub = PubSub.getInstance()

const title = ref<string | null>(null);
pubSub.subscribe("page-title-changed", (value: string | null) => {
  title.value = value
})

const last_saved = ref(' ')
// const changed = ref(false)
// watch(pageManager.currentPage, () => {
//   changed.value = false;
//   if (pageManager.currentPage.value) {
//     let date = new Date(pageManager.currentPage.value.saved * 1000);
//     if (date.getDate() == new Date().getDate())
//       saved.value = new Date(pageManager.currentPage.value.saved * 1000).toLocaleTimeString()
//     else saved.value = new Date(pageManager.currentPage.value.saved * 1000).toLocaleDateString()
//   }
// }, { deep: true })

function handleToggleMenu() {
  pubSub.emit('toggle-toolbar-menu', true)
}

</script>
<template>
  <div class="w-full h-10 bg-white border-b border-zinc-300 flex items-center pl-3 flex-none whitespace-nowrap">
    <SidebarToggle />
    <div class="text-ellipsis mx-2 overflow-hidden w-full">
      <i v-show="!title" class="fa-solid fa-home mr-3"></i>
      <span>{{ title || "Working Area" }}</span>
    </div>
    <div class="grow"></div>
    <!-- <div v-show="last_saved.length" class="text-zinc-400 mx-4 text-xs">{{ "Last Saved: " + last_saved }}</div> -->
    <button class="hover:bg-zinc-200 rounded outline-none mr-1" @click="pubSub.emit('toggle-navbar-menu', true)">
      <i class="fa-solid fa-ellipsis p-2"></i>
    </button>
    <div class="pr-[calc(138px)]"></div>
    <Menu></Menu>
  </div>
</template>

<script setup lang="ts">

import SidebarToggle from "./SidebarToggle.vue"
import Menu from "./Menu.vue"

import { ref } from 'vue'
import { PubSub } from "@src/pubSub"
const pubSub = PubSub.getInstance()

const title = ref<string | null>(null);
pubSub.subscribe("page-title-changed", (value: string | null) => {
  title.value = value
})

// const last_saved = ref('')
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

</script>
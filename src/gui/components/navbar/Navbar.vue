<template>
  <div class="w-full h-12 bg-white border-b border-gray-300 flex items-center pr-6 pl-5 flex-none whitespace-nowrap">
    <SidebarToggle />
    <div class="text-xl text-ellipsis mx-2 overflow-hidden w-full">
      <i v-show="!title" class="fa-solid fa-home mr-3"></i>
      <span>{{ title || "Working Area" }}</span>
    </div>
    <div class="grow"></div>
    <div v-show="last_saved.length" class="text-gray-400 mx-4 text-xs">{{ "Last Saved: " + last_saved }}</div>
    <button class="hover:bg-gray-200 px-3 py-1 rounded outline-none" @click="pubSub.emit('toggle-navbar-menu', true)">
      <i class="fa-solid fa-ellipsis"></i>
    </button>
    <Menu></Menu>
  </div>
</template>

<script setup lang="ts">

import { SidebarToggle, Menu } from "."

import { ref } from 'vue'
import { PubSub } from "@src/pubSub"
const pubSub = PubSub.getInstance()

const title = ref<string | null>(null);
pubSub.subscribe("page-title-changed", (value: string | null) => {
  title.value = value
})

const last_saved = ref('')
/*
const changed = ref(false)
watch(pageManager.currentPage, () => {
  changed.value = false;
  if (pageManager.currentPage.value) {
    let date = new Date(pageManager.currentPage.value.saved * 1000);
    if (date.getDate() == new Date().getDate()) 
      saved.value = new Date(pageManager.currentPage.value.saved * 1000).toLocaleTimeString()
    else saved.value = new Date(pageManager.currentPage.value.saved * 1000).toLocaleDateString()
  }
}, { deep: true })*/

</script>
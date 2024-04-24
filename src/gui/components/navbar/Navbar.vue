<template>
  <div class="w-full h-12 bg-white border-b border-gray-300 flex items-center pr-6 pl-5 flex-none whitespace-nowrap">
    <Transition name="sidebarToggle">
      <SidebarToggle v-show="showArrow" />
    </Transition>
    <div class="text-xl text-ellipsis mx-2 overflow-hidden w-full">
      <i v-show="!title" class="fa-solid fa-home mr-3"></i>
      <span>{{ title || "Working Area" }}</span>
    </div>
    <div class="grow"></div>
    <div v-show="saved.length" class="text-gray-400 mx-4 text-xs">{{ "Last Saved: " + saved }}</div>
    <Menu></Menu>
  </div>
</template>

<script setup lang="ts">

import { SidebarToggle, Menu } from ".";

import { ref, watch } from 'vue';
import { PubSub } from "@src/pubSub";
import { Editor } from "@editor";
import { PageManager } from "@renderer/state-manager/pageManager";

const editor = Editor.getInstance();
const pageManager = PageManager.getInstance();

const title = ref<string | null>(null);
editor.subscribeToTitleUpdate((value) => { title.value = value });

const saved = ref('')

const changed = ref(false)

watch(pageManager.currentPage, () => {
  changed.value = false;
  if (pageManager.currentPage.value) {
    let date = new Date(pageManager.currentPage.value.saved * 1000);
    if (date.getDate() == new Date().getDate()) saved.value = new Date(pageManager.currentPage.value.saved * 1000).toLocaleTimeString()
    else saved.value = new Date(pageManager.currentPage.value.saved * 1000).toLocaleDateString()
  }
}, { deep: true })

const showArrow = ref(false);

PubSub.subscribe('sidebar-shown', () => {
  showArrow.value = false;
});

PubSub.subscribe('sidebar-hidden', () => {
  showArrow.value = true;
});

</script>
<template>
  <div :style="{ width: transitionWidth + 'px' }" class="relative flex-none">
    <div :style="{ width: width + 'px' }"
      class=" absolute right-0 h-full bg-white border-r border-gray-300 flex flex-col flex-none overflow-x-hidden">
      <div class="text-xl pl-7 border-b border-gray-300 whitespace-nowrap flex items-center h-14 flex-none">
        <div class="py-3">
          <div>Better Editor</div>
        </div>
        <div class="grow"></div>
        <i class="fa-solid fa-angles-left cursor-pointer mr-3 hover:bg-gray-200 my-2 py-2 px-3 rounded"
          @click="pubSub.emit('hide-sidebar')"></i>
      </div>
      <div class="sidebar h-full pb-2 px-3 overflow-y-auto bg-white font-medium">
        <PageButton v-for="page in pageManager.pages.value" :page="page" :currentPage="pageManager.currentPage.value"
          @click="core.openPage(page.id)" @delete="core.deletePage(page.id)" />
        <button @click="() => { core.newPageOpen() }"
          class="px-4 py-2 w-full overflow-x-hidden text-gray-900 border-b border-gray-300 hover:bg-gray-200 text-left outline-none">
          <i class="fa-solid fa-plus mr-2"></i>
          <span>{{ "Add a page" }}</span>
        </button>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">

import PageButton from "./PageButton.vue";

import { ref } from "vue";
import { FixedSquaredTransition } from "@utils";
import { Core, PubSub, PageManager } from "@core";
const pubSub = PubSub.getInstance(); 
const core = Core.getInstance();
const pageManager = PageManager.getInstance();

const width = ref(300);
const transitionWidth = ref(300);

const transition = new FixedSquaredTransition((value) => { 
  transitionWidth.value = value 
}, 0.5, 0, width.value);

pubSub.subscribe('hide-sidebar', () => {
  transition.hide(() => {
    pubSub.emit('sidebar-hidden');
  })
});

pubSub.subscribe('show-sidebar', () => {
  transition.show(() => {
    pubSub.emit('sidebar-shown');
  })
});

</script>

<style>
.sidebar-enter-active,
.sidebar-leave-active {
  transition: none 0.5s;
}
</style>
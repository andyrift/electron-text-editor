<template>
  <div :style="{ width: transitionWidth + 'px' }" class="relative flex-none">
    <div :style="{ width: width + 'px' }"
      class="absolute right-0 h-full bg-white border-r border-gray-300 flex flex-col flex-none overflow-x-hidden">
      <div class="text-xl pl-7 border-b border-gray-300 whitespace-nowrap flex items-center h-14 flex-none">
        <div class="py-3">
          <div>Better Editor</div>
        </div>
        <div class="grow"></div>
        <i class="fa-solid fa-angles-left cursor-pointer mr-3 hover:bg-gray-200 my-2 py-2 px-3 rounded"
          @click="pubSub.emit('hide-sidebar')"></i>
      </div>
      <div class="sidebar h-full pb-2 px-3 overflow-y-auto bg-gray-100 font-medium py-2" @drop="handleDrop"
        @dragover="handleDragover">
        <div class="shadow-uni">
          <PageButton v-for="id in pageManager.rootPages.value" :key="id"
            :page="pageManager.pagesDict.value.get(id) || null" :currentPage="pageManager.currentPage.value"
            @click="core.openPage(id)" @delete="core.deletePage(id)" />
        </div>
        <PageFolder class="mt-2" v-for="folder in pageManager.folders.value" :id="folder.id" :key="folder.id">
          <template #pages>
            <PageButton v-for="id in pageManager.folderContents.value[folder.id]" :key="id"
              :page="pageManager.pagesDict.value.get(id) || null" :currentPage="pageManager.currentPage.value"
              @click="core.openPage(id)" @delete="core.deletePage(id)" />
          </template>
        </PageFolder>
        <button @click="() => { core.newPageOpen() }"
          class="px-4 py-2 mt-2 w-full overflow-x-hidden text-gray-900 hover:bg-gray-200 text-left outline-none">
          <i class="fa-solid fa-plus mr-2"></i>
          <span>{{ "Add a page" }}</span>
        </button>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">

import PageButton from "./PageButton.vue";
import PageFolder from "./PageFolder.vue";

import { ref, watch } from "vue";
import { FixedSquaredTransition } from "@utils";
import { Core, PubSub, PageManager } from "@core";
import { PageInfo } from "@types";
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

const handleDragover = (e: DragEvent) => {
  e.preventDefault()
}
const handleDrop = (e: DragEvent) => {
  e.stopPropagation()
  if (e.dataTransfer && e.dataTransfer.getData('page')) {
    let id = parseInt(e.dataTransfer.getData('page'));
    if (id) {
      pageManager.changeFolder(id, null);
    }
  }
}

</script>

<style>
.sidebartr-enter-active,
.sidebartr-leave-active {
  transition: none 0.5s;
}

.fadequick-enter-active,
.fadequick-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}

.fadequick-enter-from,
.fadequick-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}

.transition-group {
  position: relative;
}

.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scaleY(0.9);
}

.fade-leave-active {
  position: absolute;
}
</style>
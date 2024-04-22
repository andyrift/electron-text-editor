<template>
  <div class="relative" ref="container">
    <button @click="handleShow" @drop="handleDrop"
      @dragover="handleDragover"
      class="px-4 py-2 w-full overflow-x-hidden text-gray-900 hover:bg-gray-200 text-left outline-none">
      <i class="fa-solid fa-trash-can mr-2"></i>
      <span>{{ "Trash can" }}</span>
    </button>
    <Veil :show="showTrash" :callback="() => {showTrash = false}"></Veil>
    <Transition name="fadetool">
      <div :style="style" v-if=showTrash @click="(e) => {e.stopPropagation()}" class="absolute z-20 bg-white shadow-unilg rounded-md border border-gray-300 min-w-64 divide-y divide-gray-300 max-h-96 max-w-xl overflow-hidden flex flex-col">
        <div class="flex-none py-2 px-3 bg-gray-100 rounded-t-md font-medium">
          Deleted Pages
        </div>
        <div class="flex-grow p-2 overflow-y-auto">
          <TrashPage v-for="page in pages" :key="page.id" :title="page.title" :timestamp="page.deleted || 0" @restore="handleRestore(page.id)"  @delete="handleDelete(page.id)" />
          <div v-if="pages.length == 0" class="text-gray-400">Empty</div>
        </div>
        <div class="flex-none px-2 py-1 text-sm bg-gray-100 rounded-b-md text-gray-400">
          Pages are not automatically deleted
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">

import { Veil } from "@components";
import { Core, PageManager } from "@core";
import { ref, computed, nextTick } from 'vue';

import TrashPage from "./TrashPage.vue";

const core = Core.getInstance();
const pageManager = PageManager.getInstance();

const left = ref(0);
const bottom = ref(0);

const style = computed(() => {
  return {
    bottom: bottom.value + 'px',
    left: left.value + 'px',
  };
});

const pages = pageManager.deletedPages

const showTrash = ref(false);

const container = ref();

const handleShow = async () => {
  showTrash.value = true;
  await nextTick();
  if (!container.value) {
    showTrash.value = false;
    return;
  }
  bottom.value = 4
  left.value = container.value.clientWidth + 4

}

const handleDragover = (e: DragEvent) => {
  e.preventDefault()
}
const handleDrop = (e: DragEvent) => {
  e.stopPropagation()
  if (e.dataTransfer && e.dataTransfer.getData('page')) {
    let id = parseInt(e.dataTransfer.getData('page'));
    if (id) {
      core.trashPage(id);
    }
  }
}

const handleRestore = (id: number) => {
  core.restorePageAndSwitch(id);
  showTrash.value = false;
}

const handleDelete = (id: number) => {
  pageManager.deletePage(id);
}
</script>
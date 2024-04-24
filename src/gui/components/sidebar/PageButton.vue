<template>
  <div @click="() => { emit('click'); }" @mouseenter="hover = true" @mouseleave="hover = false" draggable="true"
    @dragover="handleDragover" @drop="handleDrop" @dragstart="handleDragStart"
    class="px-4 py-2 cursor-pointer overflow-visible  text-gray-900 border-b border-b-gray-300 /border-x-2 border-x-gray-500 hover:bg-gray-200 text-left whitespace-pre hover:text-wrap"
    :class="currentPage && page && page.id == currentPage.id ? 'bg-gray-200' : 'bg-white'">
    <div class="flex w-full">
      <div class="text-ellipsis w-full overflow-hidden select-none">
        <i class="fa-solid fa-file-lines mr-3 text-gray-700"></i><span>{{ page && (page.title || "Untitled") || "Error"
          }}</span>
      </div>
      <div class="grow"></div>
      <IconButton :hover="hover" :newOnClick="() => { emit('delete'); }">
        <i class="fa-solid fa-trash-can"></i>
      </IconButton>
      <div class="w-2 flex-none"></div>      
      <div class="relative">
        <IconButton :hover="hover" :newOnClick="() => { folderMenu = true }">
          <i class="fa-solid fa-folder"></i>
        </IconButton>
        <div v-if="folderMenu" class="fixed cursor-default z-10 top-0 left-0 w-screen h-screen bg-black opacity-0"
          @click="(e) => { e.stopPropagation(); folderMenu = false; hover = false; }">
        </div>
        <Transition name="fadequick">

          <div v-if="folderMenu" class="absolute right-0 z-20 bg-white p-2 shadow-unilg mt-2 rounded-md border border-gray-300 w-48"
            @click="(e) => { e.stopPropagation() }">
            <div class="max-h-64 overflow-y-auto text-gray-800 ">
              <div :class="page && page.folder == null ? 'bg-gray-200' : ''"
                class="py-1 px-2 text-ellipsis overflow-hidden hover:bg-gray-200" @click="changeFolder($event, null)">
                <i class="fa-solid fa-minus mr-3"></i><span>No folder</span>
              </div>
              <div class="py-1 px-2 text-ellipsis overflow-hidden hover:bg-gray-200"
                @click="changeFolder($event, null, true)">
                <i class="fa-solid fa-folder-plus mr-3"></i><span>New Folder</span>
              </div>
              <div class="border-t pt-1 mt-1">
                <div v-for="folder in pageManager.folders.value" :key="folder.id"
                  class="py-1 px-2 text-ellipsis overflow-hidden hover:bg-gray-200"
                  :class="page && page.folder == folder.id ? 'bg-gray-200' : ''"
                  @click="changeFolder($event, folder.id)">
                  <i class="fa-solid fa-folder mr-3"></i><span>{{ folder.name || "Unnamed" }}</span>
                </div>
              </div>
            </div>
          </div>

        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PubSub } from "@src/pubSub";
import { Core } from "@renderer/core";
import { PageManager } from "@renderer/state-manager/pageManager";
import type { PageInfo } from '@types';
import { ref } from 'vue';

import { IconButton } from '@components';

const hover = ref(false);

const pageManager = PageManager.getInstance();
const core = Core.getInstance();

const folderMenu = ref(false);

const changeFolder = async (e: Event, id: (number | null), create: boolean = false) => { 
  e.stopPropagation(); 
  folderMenu.value = false; 
  hover.value = false; 
  if (props.page) {
    if (props.page.folder) PubSub.getInstance().emit('remove-from-folder', props.page.folder)
    if (create) await core.changeToNewFolder(props.page.id);
    else await pageManager.changePageFolder(props.page.id, id);
  }
}

const emit = defineEmits<{ 
  click: [],
  delete: []
}>();

const props = defineProps<{
  page: PageInfo | null,
  currentPage: PageInfo | null,
}>();

const handleDragStart = (e: DragEvent) => {
  if (e.dataTransfer && props.page) {
    e.dataTransfer.setData('page', props.page.id.toString())
  }
}

const handleDragover = (e: DragEvent) => {
  e.preventDefault()
}

const handleDrop = (e: DragEvent) => {
  e.stopPropagation()
  if (e.dataTransfer && e.dataTransfer.getData('page')) {
    let id = parseInt(e.dataTransfer.getData('page'));
    if (id && props.page) {
      pageManager.changePageFolder(id, props.page.folder);
    }
  }
}

</script>
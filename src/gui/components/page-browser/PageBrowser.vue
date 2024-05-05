<template>
  <div class="min-h-full px-2 text-sm bg-white /border border-black" @drop="handleDrop" @dragover="handleDragover">
    <template v-for="item in browserStructure" :key="item.id">
      <BrowserFolder v-if="item.type == 'folder'" :key="'f' + item.id" :itemid="item.id" :open="item.open"
        :name="item.name" :content="item.content">
      </BrowserFolder>
      <BrowserPage v-else-if="item.type == 'page'" :key="'p' + item.id" :itemid="item.id" :title="item.title">
      </BrowserPage>
    </template>
    <button @click="() => { pubSub.emit('browser-create-page') }"
      class="px-2 py-0.5 mt-1 w-1/2 overflow-x-hidden text-zinc-500 hover:bg-zinc-200 text-left font-medium outline-none">
      <i class="fa-solid fa-plus mr-2"></i>
      <i class="fa-solid fa-file-lines mr-2"></i>
      <span>{{ "New page" }}</span>
    </button>
    <button @click="() => { pubSub.emit('browser-create-folder') }"
      class="px-2 py-0.5 mt-1 w-1/2 overflow-x-hidden text-zinc-500 hover:bg-zinc-200 text-left font-medium outline-none">
      <i class="fa-solid fa-plus mr-2"></i>
      <i class="fa-solid fa-folder mr-2"></i>
      <span>{{ "New folder" }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">

import BrowserFolder from './BrowserFolder.vue'
import BrowserPage from './BrowserPage.vue'

import { ref } from 'vue'

import { PubSub } from "@src/pubSub"
const pubSub = PubSub.getInstance()

import type { BrowserHierarchy, FolderOpen } from "./pageBrowser"
import type { StructureHierarchy } from "@src/workspace-manager/workspaceStructure"

const browserStructure = ref<BrowserHierarchy>([])
const folderOpen = ref<FolderOpen>({})

import { constructContent, constructOpen, updateOpenInStructure, updateNameInStructure } from "./pageBrowser"

function acceptStructure(structure: StructureHierarchy) {
  const folders = window.getters.getWorkspaceFolders()
  const pages = window.getters.getWorkspacePages()
  browserStructure.value = constructContent(structure, folders, pages, folderOpen.value)
  folderOpen.value = constructOpen(browserStructure.value)
}

pubSub.subscribe("folder-open-changed", (id: number, value: boolean) => {
  folderOpen.value[id] = value
  updateOpenInStructure(browserStructure.value, id, value)
})

pubSub.subscribe("workspace-folders-changed", (id: number) => {
  const folder = window.getters.getWorkspaceFolders().get(id)
  if (!folder) return
  updateNameInStructure(browserStructure.value, id, folder.name)
})

pubSub.subscribe("workspace-structure-init-end", acceptStructure)
pubSub.subscribe("workspace-structure-changed", acceptStructure)


const handleDragover = (e: DragEvent) => {
  e.preventDefault()
}
const handleDrop = (e: DragEvent) => {
  e.stopPropagation()
  if (e.dataTransfer) {
    if (e.dataTransfer.getData('page-browser-drag-page')) {
      let pageid = parseInt(e.dataTransfer.getData('page-browser-drag-page'))
      if (pageid) pubSub.emit("change-page-folder", pageid, null)
    }
    if (e.dataTransfer.getData('page-browser-drag-folder')) {
      let folderid = parseInt(e.dataTransfer.getData('page-browser-drag-folder'))
      if (folderid) pubSub.emit("change-folder-folder", folderid, null)
    }
  }
}

</script>
<template>
  <div class="min-h-full px-2 text-sm bg-white /border border-black" @drop="handleDrop" @dragover="handleDragover">
    <div @selectpage.stop="handleSelectPage" @deletepage.stop="handleDeletePage">
      <template v-for="item in browserStructure" :key="item.key">
        <BrowserFolder v-if="item.type == 'folder'" key="folders" :itemid="item.id" :open="item.open"
          :name="item.name" :content="item.content" :currentPage="currentPage">
        </BrowserFolder>
        <BrowserPage v-else-if="item.type == 'page'" key="pages" :itemid="item.id" :title="item.title"
          :currentPage="currentPage">
        </BrowserPage>
      </template>
    </div>
    <button @click="handleCreatePage"
      class="px-2 py-0.5 mt-1 w-1/2 overflow-x-hidden text-zinc-500 hover:bg-zinc-200 text-left font-medium outline-none">
      <i class="fa-solid fa-plus mr-2"></i>
      <i class="fa-solid fa-file-lines mr-2"></i>
      <span>{{ "New page" }}</span>
    </button>
    <button @click="handleCreateFolder"
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
const currentPage = ref<number | null>(null)

import { constructContent, constructOpen, updateOpenInStructure, updateNameInStructure, updateOpensInStructure } from "./pageBrowser"

function acceptStructure(structure: StructureHierarchy) {
  const folders = WorkspaceManager.getInstance().getFolderMap()
  const pages = WorkspaceManager.getInstance().getPageMap()
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

import { WorkspaceManager } from '@src/workspace-manager/workspaceManager'

pubSub.subscribe("workspace-structure-init-end", () => {
  acceptStructure(WorkspaceManager.getInstance().getStructure())
})
pubSub.subscribe("workspace-structure-changed", acceptStructure)

function handleDragover(e: DragEvent) {
  e.preventDefault()
}

function handleDrop(e: DragEvent) {
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

function handleSelectPage(e: CustomEvent) {
  const id: number = parseInt(e.detail["pageID"])
  pubSub.emit('browser-open-page', id)
}

function handleDeletePage(e: CustomEvent) {
  const id: number = parseInt(e.detail["pageID"])
  pubSub.emit('browser-delete-page', id)
}

function handleCreatePage(e: MouseEvent) {
  pubSub.emit('browser-create-page')
}

function handleCreateFolder(e: MouseEvent) {
  pubSub.emit('browser-create-folder')
}

pubSub.subscribe("current-page-changed", (id: number) => {
  currentPage.value = id
  const pages = WorkspaceManager.getInstance().getPageMap()
  const folders = WorkspaceManager.getInstance().getFolderMap()
  const page = pages.get(id)
  if (!page) return
  let current: number | null = page.folder
  while (current !== null) {
    console.log("check", current)
    folderOpen.value[current] = true
    const folder = folders.get(current)
    if (!folder) break
    current = folder.folder
  }
  updateOpensInStructure(browserStructure.value, folderOpen.value)
})

</script>
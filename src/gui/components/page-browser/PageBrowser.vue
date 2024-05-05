<template>
  <div class="h-full py-1 px-1 text-sm /border border-black" @drop="handleDrop" @dragover="handleDragover">
    <template v-for="item in structure" :key="item.id">
      <BrowserFolder v-if="item.type == 'folder'" :id="item.id" :name="item.name" :content="item.content"></BrowserFolder>
      <BrowserPage v-else-if="item.type == 'page'" :id="item.id" :title="item.title"></BrowserPage>
    </template>
    <button @click="() => { pubSub.emit('create-page-browser') }"
      class="px-2 py-1 mt-1 w-full overflow-x-hidden text-zinc-600 hover:bg-zinc-200 text-left font-medium outline-none">
      <i class="fa-solid fa-plus mr-2"></i>
      <span>{{ "Add a page" }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">

import BrowserFolder from './BrowserFolder.vue'
import BrowserPage from './BrowserPage.vue'

import { ref } from 'vue'

import { PubSub } from "@src/pubSub"
const pubSub = PubSub.getInstance()

type Page = {
  type: "page"
  id: number
  title: string | null
}

type Folder = {
  type: "folder"
  id: number
  content: Array<Page | Folder>
  name: string | null
}

const structure = ref <Array<Page | Folder>>([])

function pushContent(content: Array<StructurePage | StructureFolder>, 
  folders: ReturnType<typeof window.getters.getWorkspaceFolders>, 
  pages: ReturnType<typeof window.getters.getWorkspacePages>) {
  const str: typeof structure.value = []
  content.forEach(item => {
    if ("content" in item) {
      const folder = folders.get(item.id)
      if (!folder) throw "Workspage structure not synchronized. Folder exists in structure but not in map"
      str.push({
        type: "folder",
        id: item.id,
        name: folder.name,
        content: pushContent(item.content, folders, pages)
      })
    } else {
      const page = pages.get(item.id)
      if (!page) throw "Workspage structure not synchronized. Page exists in structure but not in map"
      str.push({
        type: "page",
        id: page.id,
        title: page.title
      })
    }
  })
  return str
}

type StructurePage = {
  id: number
}

type StructureFolder = {
  id: number
  content: Array<StructurePage | StructureFolder>
}

function acceptStructure(value: Array<StructurePage | StructureFolder>) {
  const folders = window.getters.getWorkspaceFolders()
  const pages = window.getters.getWorkspacePages()
  structure.value = pushContent(value, folders, pages)
}

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
<template>
  <div class="text-zinc-700 bg-white" :draggable="draggable" @drop="handleDrop" @dragover="handleDragover"
    @dragend="draggable=false" @dragstart="handleDragStart">
    <div class="flex hover:bg-zinc-200" @mouseenter="hover = true" @mouseleave="hover = false">
      <div class="cursor-pointer grow select-none whitespace-nowrap text-ellipsis overflow-hidden px-2 py-0.5"
        @click="toggleOpen" @mousedown="draggable = true" @mouseup="draggable = false">
        <i class="fa-solid fa-folder mr-2"></i>
        <span :class="content.length == 0 ? 'text-gray-700 text-opacity-50' : ''">{{ input || "Unnamed" }}</span>
      </div>
      <div class="flex px-2 py-0.5">
        <IconButton :hover="hover" :newOnClick="() => {}">
          <i class="fa-solid fa-trash-can"></i>
        </IconButton>
        <div class="w-1 flex-none"></div>
        <IconButton :hover="hover" :newOnClick="toggleRename">
          <i class="fa-solid fa-pen"></i>
        </IconButton>
      </div>
      <div class="relative">
        <Veil :show="showRename" :callback="() => { showRename = false; hover = false }"></Veil>
        <div v-if="showRename"
          class="absolute top-6 right-0 z-20 bg-white p-1 shadow-unilg rounded-md border border-zinc-300 flex items-center">
          <input ref="inp" v-model="input" class="border-2 border-zinc-300 rounded px-1 py-0.5
          outline-none" type="text" @keydown="(e: KeyboardEvent) => { if (e.key == 'Enter') saveName() }"></input>
          <i class="rounded mx-1 p-1 text-xl fa-solid fa-check opacity-30 hover:opacity-100 transition-opacity cursor-pointer"
            @click="saveName"></i>
        </div>
      </div>
    </div>
    <div v-if="open" class="ml-1 px-0 border-l-2 border-l-gray-300"
      :class="content.length == 0 ? 'text-zinc-700 text-opacity-50' : ''">
      <template v-for="item in content" :key="item.id">
        <BrowserFolder v-if="item.type == 'folder'" :id="item.id" :name="item.name" :content="item.content">
        </BrowserFolder>
        <BrowserPage v-else-if="item.type == 'page'" :id="item.id" :title="item.title"></BrowserPage>
      </template>
      <div v-if="content.length == 0" class="py-1 pl-2">
        Empty
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import BrowserPage from './BrowserPage.vue'

import { IconButton, Veil } from '@components'
import { nextTick, ref } from 'vue'

import { PubSub } from "@src/pubSub"
const pubSub = PubSub.getInstance()

const draggable = ref(false)

const hover = ref(false)
const showRename = ref(false)

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

const props = defineProps<{
  id: number,
  name: string | null
  open?: boolean
  content: Array<Page | Folder>
}>();

const open = ref(false);

const input = ref<string | null>(props.name)
const inp = ref<HTMLElement | null>(null)

const toggleOpen = async () => {
  open.value = !open.value
}

const toggleRename = async () => {
  showRename.value = true
  await nextTick()
  if (inp.value) inp.value.focus()
}

const saveName = () => {
  showRename.value = false
  hover.value = false
}

const handleDragStart = (e: DragEvent) => {
  if (e.dataTransfer) {
    e.stopPropagation()
    e.dataTransfer.setData('page-browser-drag-folder', props.id.toString())
  }
}

const handleDragover = (e: DragEvent) => {
  e.preventDefault()
}

const handleDrop = (e: DragEvent) => {
  e.stopPropagation()
  if (e.dataTransfer) {
    if (e.dataTransfer.getData('page-browser-drag-page')) {
      let pageid = parseInt(e.dataTransfer.getData('page-browser-drag-page'))
      if (pageid) pubSub.emit("change-page-folder", pageid, props.id)
    }
    if (e.dataTransfer.getData('page-browser-drag-folder')) {
      let folderid = parseInt(e.dataTransfer.getData('page-browser-drag-folder'))
      if (folderid) pubSub.emit("change-folder-folder", folderid, props.id)
    }
  }
}

</script>

<style>

</style>
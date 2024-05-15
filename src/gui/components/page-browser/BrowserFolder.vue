<template>
  <div class="text-zinc-700" @drop="handleDrop" @dragover="handleDragover" @dragend="draggable=false">
    <div :draggable="draggable" @dragstart="handleDragStart" class="flex hover:bg-zinc-200" @mouseenter="hover = true"
      @mouseleave="hover = false">
      <div class="cursor-pointer grow select-none whitespace-nowrap text-ellipsis overflow-hidden pr-2 py-0.5"
        @click="toggleOpen" @mousedown="draggable = true" @mouseup="draggable = false">
        <div class="ml-1 mr-1.5 w-3 inline-block text-center">
          <i class="fa-solid text-xs" :class="open ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
        </div>
        <span :class="content.length == 0 ? 'text-zinc-700 text-opacity-50' : ''">{{ input || "Unnamed" }}</span>
      </div>
      <div class="flex px-2 py-0.5">
        <IconButton :hover="hover" :newOnClick="() => { pubSub.emit('browser-delete-folder', itemid) }">
          <i class="fa-solid fa-trash-can"></i>
        </IconButton>
        <div class="w-1 flex-none"></div>
        <IconButton :hover="hover" :newOnClick="toggleRename">
          <i class="fa-solid fa-pen"></i>
        </IconButton>
      </div>
      <div class="relative">
        <Veil :show="showRename" :callback="rejectName"></Veil>
        <div v-if="showRename"
          class="absolute top-6 right-0 z-20 bg-white p-1 shadow-unilg rounded-md border border-zinc-300 flex items-center">
          <input ref="inputElement" v-model="input" class="border-2 border-zinc-300 rounded px-1 py-0.5
          outline-none" type="text" @keydown="(e: KeyboardEvent) => { if (e.key == 'Enter') saveName() }"></input>
          <i class="rounded mx-1 p-1 text-xl fa-solid fa-check opacity-30 hover:opacity-100 transition-opacity cursor-pointer"
            @click="saveName"></i>
        </div>
      </div>
    </div>
    <div v-if="open" class="ml-2 px-0 border-l border-l-zinc-300"
      :class="content.length == 0 ? 'text-zinc-700 text-opacity-50' : ''">
      <template v-for="item in content" :key="item.type == 'folder' ? 'f' : 'p' + item.id">
        <BrowserFolder v-if="item.type == 'folder'" :key="'f' + item.id" :itemid="item.id" :open="item.open"
          :name="item.name" :content="item.content">
        </BrowserFolder>
        <BrowserPage v-else-if="item.type == 'page'" :key="'p' + item.id" :itemid="item.id" :title="item.title">
        </BrowserPage>
      </template>
      <!-- <div v-if="content.length == 0" class="py-1 pl-2">
        Empty
      </div> -->
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

import { BrowserHierarchy } from './pageBrowser';


const props = defineProps<{
  itemid: number,
  name: string | null
  open: boolean
  content: BrowserHierarchy
}>();

const open = ref(props.open);

const input = ref<string | null>(props.name)
const inputElement = ref<HTMLElement | null>(null)

const toggleOpen = () => {
  open.value = !open.value
  pubSub.emit("folder-open-changed", props.itemid, open.value)
}

const toggleRename = async () => {
  showRename.value = true
  await nextTick()
  if (inputElement.value) inputElement.value.focus()
}

const saveName = () => {
  showRename.value = false
  hover.value = false
  pubSub.emit("change-folder-name", props.itemid, input.value)
}

const rejectName = () => {
  showRename.value = false
  hover.value = false
  input.value = props.name
}

const handleDragStart = (e: DragEvent) => {
  if (e.dataTransfer) {
    e.stopPropagation()
    e.dataTransfer.setData('page-browser-drag-folder', props.itemid.toString())
  }
}

const handleDragover = (e: DragEvent) => {
  e.preventDefault()
}

const handleDrop = async (e: DragEvent) => {
  e.stopPropagation()
  if (e.dataTransfer) {
    if (e.dataTransfer.getData('page-browser-drag-page')) {
      if (!open.value) toggleOpen()
      await nextTick()
      let pageid = parseInt(e.dataTransfer.getData('page-browser-drag-page'))
      if (pageid) pubSub.emit("change-page-folder", pageid, props.itemid)
    }
    if (e.dataTransfer.getData('page-browser-drag-folder')) {
      if (!open.value) toggleOpen()
      await nextTick()
      let folderid = parseInt(e.dataTransfer.getData('page-browser-drag-folder'))
      if (folderid) pubSub.emit("change-folder-folder", folderid, props.itemid)
    }
  }
}

</script>

<style>

</style>
<template>
  <div @mouseenter="hover = true" @mouseleave="hover = false" draggable="true" @dragstart="handleDragStart"
    @click="handleSelectPage"
    class="px-2 py-0.5 cursor-pointer overflow-visible  text-zinc-900 /border-b border-b-zinc-300 /border-x-2 border-x-zinc-500 hover:bg-zinc-200 text-left whitespace-pre hover:text-wrap"
    :class="current ? 'bg-zinc-200' : ''">
    <div class="flex">
      <div class="text-ellipsis overflow-hidden select-none">
        <i class="fa-solid fa-file-lines mr-2 text-zinc-700"></i><span>{{ title || "Untitled" }}</span>
      </div>
      <div class="grow"></div>
      <IconButton :hover="hover" @clickbutton="handleDeletePage">
        <i class="fa-solid fa-trash-can"></i>
      </IconButton>
    </div>
  </div>
</template>

<script setup lang="ts">

import { IconButton } from '@components'

import { ref } from 'vue';

import { PubSub } from "@src/pubSub"
const pubSub = PubSub.getInstance()

const hover = ref(false)

import { WorkspaceManager } from '@src/workspace-manager/workspaceManager';

const emit = defineEmits<{
  selectPage: [e: MouseEvent, id: number]
}>()

const props = defineProps<{
  itemid: number,
  title: string | null,
}>()

const current = ref(WorkspaceManager.getInstance().getCurrentPageId() == props.itemid)

function handleDragStart (e: DragEvent) {
  if (e.dataTransfer) {
    e.stopPropagation()
    e.dataTransfer.setData('page-browser-drag-page', props.itemid.toString())
  }
}

function handleSelectPage(e: MouseEvent) {
  const customEvent = new CustomEvent("selectpage", { bubbles: true, detail: { pageID: props.itemid } })
  e.target?.dispatchEvent(customEvent)
}

function handleDeletePage(e: MouseEvent) {
  const customEvent = new CustomEvent("deletepage", { bubbles: true, detail: { pageID: props.itemid } })
  e.target?.dispatchEvent(customEvent)
}

</script>
<template>
  <div class="min-h-full px-2 text-sm bg-white /border border-black">
    <template v-for="item in browserStructure" :key="item.id">
      <BrowserPage :page="item" @restorepage="handleRestore" @deletepage="handleDelete"></BrowserPage>
    </template>
    <div v-if="browserStructure.length == 0" class="py-1 px-2 text-zinc-600">
      Empty
    </div>
  </div>
</template>

<script setup lang="ts">

import BrowserPage from './BrowserPage.vue'

import { ref } from 'vue'

import { PubSub } from "@src/pubSub"
const pubSub = PubSub.getInstance()

import type { Page } from '@src/database/model';

const browserStructure = ref<Page[]>([])

function handleRestore(e: MouseEvent, id: number) {
  pubSub.emit('trash-restore-page', id)
}

function handleDelete(e: MouseEvent, id: number) {
  pubSub.emit('trash-delete-page', id)
}

function constructContent(structure: number[], pages: Map<number, Page>) {
  const str: Page[] = []
  structure.forEach(id => {
    const page = pages.get(id)
    if (!page) throw "Workspage structure not synchronized. Page exists in trash structure but not in map"
    str.push(page)
  })
  return str
}

function acceptStructure(structure: number[]) {
  const pages = WorkspaceManager.getInstance().getPageTrashMap()
  browserStructure.value = constructContent(structure, pages)
}

import { WorkspaceManager } from '@src/workspace-manager/workspaceManager'

pubSub.subscribe("workspace-structure-init-end", () => {
  acceptStructure(WorkspaceManager.getInstance().getTrashStructure())
})
pubSub.subscribe("workspace-trash-changed", () => {
  acceptStructure(WorkspaceManager.getInstance().getTrashStructure())
})

</script>
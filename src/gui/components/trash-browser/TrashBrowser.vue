<template>
  <div class="min-h-full px-2 text-sm bg-white /border border-black">
    <template v-for="item in browserStructure" :key="item.id">
      <BrowserPage :page="item" @restorepage="handleRestore" @deletepage="handleDelete"></BrowserPage>
    </template>
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
  console.log("restore", id)
}

function handleDelete(e: MouseEvent, id: number) {
  console.log("delete", id)
}

browserStructure.value = [
  {
    id: 1,
    title: "page 1",
    last_saved: 0,
    deleted: 0,
    folder: null
  },
  {
    id: 2,
    title: null,
    last_saved: 0,
    deleted: 0,
    folder: null
  },
  {
    id: 3,
    title: "page 3",
    last_saved: 0,
    deleted: 0,
    folder: null
  }
]

</script>
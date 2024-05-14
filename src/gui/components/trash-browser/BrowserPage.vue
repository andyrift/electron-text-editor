<template>
  <div @mouseenter="hover = true" @mouseleave="hover = false"
    class="px-2 py-0.5 cursor-pointer overflow-visible text-zinc-900 /border-b border-b-zinc-300 /border-x-2 border-x-zinc-500 hover:bg-zinc-200 text-left whitespace-pre hover:text-wrap">
    <div class="flex">
      <div class="text-ellipsis overflow-hidden select-none">
        <i class="fa-solid fa-file-lines mr-2 text-zinc-700"></i>
        <span>{{ page.title || "Untitled" }}</span>
      </div>
      <div class="grow"></div>
      <span class="mx-2 text-gray-400 text-xs"> {{ date }} </span>
      <IconButton :hover="hover" title="Restore Page" @clickbutton="handleRestore">
        <i class="fa-solid fa-trash-can-arrow-up"></i>
      </IconButton>
      <div class="w-1 flex-none"></div>
      <IconButton :hover="hover" title="Delete Permanently" @clickbutton="handleDelete">
        <i class="fa-solid fa-trash-can text-red-500"></i>
      </IconButton>
    </div>
  </div>
</template>

<script setup lang="ts">

import { IconButton } from '@components'

import { ref, computed } from 'vue'

import { Page } from '@src/database/model'

const hover = ref(false);

const props = defineProps<{
  page: Page
}>()

const date = computed(() => {
  return props.page.deleted !== null ?
    new Date(props.page.deleted * 1000).toLocaleString() :
    "Page is not deleted"
})

const emit = defineEmits<{
  restorepage: [e: MouseEvent, id: number],
  deletepage: [e: MouseEvent, id: number],
}>()

function handleRestore(e: MouseEvent) {
  emit("restorepage", e, props.page.id)
}

function handleDelete(e: MouseEvent) {
  emit("deletepage", e, props.page.id)
}

</script>
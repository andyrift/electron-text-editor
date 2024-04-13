<template>
  <div @click="() => { emit('click'); }"
    class="px-4 py-2 w-full cursor-pointer overflow-x-hidden text-gray-900 border-b border-gray-300 hover:bg-gray-200 text-left whitespace-pre hover:text-wrap"
    :class="currentPage && page.id == currentPage.id ? 'bg-gray-200' : ''">
    <div class="flex w-full overflow-hidden">
      <div class="text-ellipsis w-full overflow-hidden">
        <span>{{ page.title || "Untitled" }}</span>
      </div>
      <div class="grow"></div>
      <button class="ml-1 opacity-50 hover:opacity-100 h-fit outline-none"
        @click="(e) => { e.stopPropagation(); emit('delete'); }">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import type { PageInfo } from '@core';

const emit = defineEmits<{ 
  click: [],
  delete: []
}>()
const props = defineProps<{
  page: PageInfo,
  currentPage: PageInfo | null
}>();
</script>
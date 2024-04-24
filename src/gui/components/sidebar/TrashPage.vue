<template>
  <div @mouseenter="hover = true" @mouseleave="hover = false"
    class="px-4 py-2 cursor-pointer overflow-visible  text-gray-900 rounded hover:bg-gray-200 text-left whitespace-pre hover:text-wrap">
    <div class="flex w-full items-center">
      <div class="text-ellipsis w-full overflow-hidden select-none">
        <i class="fa-solid fa-file-lines mr-3 text-gray-700"></i>
        <span>{{ title || "Untitled" }}</span>
      </div>
      <span class="mx-2 text-gray-400 text-xs">{{ new Date(timestamp * 1000).toLocaleString() }}</span>
      <div class="grow"></div>
      <IconButton :hover="hover" title="Restore Page" :newOnClick="() => {emit('restore')}">
        <i class="fa-solid fa-trash-can-arrow-up"></i>
      </IconButton>
      <div class="w-2 flex-none"></div>
      <IconButton :hover="hover" title="Delete Permanently" :newOnClick="() => {emit('delete')}">
        <i class="fa-solid fa-trash-can text-red-500"></i>
      </IconButton>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IconButton } from '@components';

const hover = ref(false);

const emit = defineEmits<{ 
  delete: [],
  restore: []
}>();

const props = defineProps<{
  title: string | null,
  timestamp: number
}>();

</script>
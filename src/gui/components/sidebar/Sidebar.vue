<template>
  <div v-show="show" :style="{ width: transitionWidth + 'px' }" class="relative flex-none">
    <div :style="{ width: width + 'px' }"
      class="absolute right-0 h-full bg-white border-r border-zinc-300 flex flex-col flex-none">
      <div class="pl-5 border-b border-zinc-300 whitespace-nowrap flex items-center h-10 flex-none select-none">
        <div class="py-1 cursor-default">
          <div>Browser</div>
        </div>
        <div class="grow"></div>
        <i class="fa-solid fa-angles-left cursor-pointer mr-3 hover:bg-zinc-200 my-1 p-2 rounded"
          @click.stop="handleToggleSidebar"></i>
      </div>
      <div class="divide-y divide-zinc-300 h-full flex flex-col">
        <div @click.stop="handleTogglePageBrowser"
          class="px-2 py-1 w-full overflow-x-hidden text-sm font-medium text-gray-900 hover:bg-gray-200 text-left outline-none flex-none select-none cursor-pointer">
          <i v-if="showContainers.pageBrowser" class="fa-solid fa-chevron-down mr-2"></i>
          <i v-else class="fa-solid fa-chevron-right mr-2"></i>
          <span>Page Browser</span>
        </div>
        <div v-show="showContainers.pageBrowser" class="sidebar grow w-full overflow-y-auto bg-zinc-100">
          <PageBrowser />
        </div>
        <div class="border-t border-zinc-300">
          <div @click.stop="handleToggleTrashBrowser"
            class="px-2 py-1 w-full overflow-x-hidden text-sm font-medium text-gray-900 hover:bg-gray-200 text-left outline-none flex-none select-none cursor-pointer">
            <i v-if="showContainers.trashBrowser" class="fa-solid fa-chevron-down mr-2"></i>
            <i v-else class="fa-solid fa-chevron-right mr-2"></i>
            <i class="fa-solid fa-trash-can mr-2"></i>
            <span>Trash can</span>
          </div>
        </div>
        <div v-show="showContainers.trashBrowser" class="sidebar grow w-full overflow-y-auto bg-zinc-100">
          <TrashBrowser />
        </div>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">

import PageBrowser from "../page-browser/PageBrowser.vue";
import TrashBrowser from "../trash-browser/TrashBrowser.vue";

import { ref } from "vue"
import { FixedSquaredTransition } from "@utils"

import { PubSub } from "@src/pubSub"
const pubSub = PubSub.getInstance()

const show = ref(true)
const width = ref(300)
const transitionWidth = ref(300)

const transition = new FixedSquaredTransition((value) => {
  transitionWidth.value = value
}, 0.5, 0, width.value)

function handleToggleSidebar(e: MouseEvent) {
  pubSub.emit('toggle-sidebar', false)
}

const showContainers = ref({
  pageBrowser: true,
  trashBrowser: false,
})

function handleTogglePageBrowser(e: MouseEvent) {
  showContainers.value.pageBrowser = !showContainers.value.pageBrowser
}

function handleToggleTrashBrowser(e: MouseEvent) {
  showContainers.value.trashBrowser = !showContainers.value.trashBrowser
}

pubSub.subscribe("toggle-sidebar-end", (value: boolean) => {
  if (!value) show.value = false
})

pubSub.subscribe("toggle-sidebar", (value: boolean) => {
  if (value) show.value = true
})

pubSub.subscribe("toggle-sidebar", (value: boolean) => {
  if (value) transition.show(() => {
    pubSub.emit('toggle-sidebar-end', true)
  })
  else transition.hide(() => {
    pubSub.emit('toggle-sidebar-end', false)
  })
})

</script>
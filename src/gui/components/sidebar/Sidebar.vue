<template>
  <div v-show="show" :style="{ width: transitionWidth + 'px' }" class="relative flex-none">
    <div :style="{ width: width + 'px' }"
      class="absolute right-0 h-full bg-white border-r border-zinc-300 flex flex-col flex-none">
      <div class="pl-5 border-b border-zinc-300 whitespace-nowrap flex items-center h-10 flex-none">
        <div class="py-1">
          <div>Better Editor</div>
        </div>
        <div class="grow"></div>
        <i class="fa-solid fa-angles-left cursor-pointer mr-3 hover:bg-zinc-200 my-1 p-2 rounded"
          @click="pubSub.emit('toggle-sidebar', false)"></i>
      </div>
      <div class="sidebar h-full w-full overflow-y-auto bg-zinc-100">
        <PageBrowser />
      </div>
    <div class="border-t border-zinc-300">
      <!-- <TrashButton /> -->
    </div>
  </div>
  </div>

</template>

<script setup lang="ts">

import PageBrowser from "../page-browser/PageBrowser.vue";

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
<template>
  <Transition name="sidebarToggle">
    <div v-show="show" :style="{ width: width + 'px' }" class="text-xl flex-none relative h-9">
      <div class="absolute right-0">
        <i class="h-9 flex-none fa-solid fa-angles-right cursor-pointer mr-1 hover:bg-gray-200 py-2 px-3 rounded"
          @click="showSidebar"></i>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { FixedSquaredTransition } from "@utils"
import { ref } from "vue"

import { PubSub } from "@src/pubSub"
const pubSub = PubSub.getInstance()

const show = ref(false)
const width = ref(40)

const transition = new FixedSquaredTransition((value) => {
  width.value = value
}, 0.5, 0, width.value, false)

width.value = 0

pubSub.subscribe('toggle-sidebar-end', (value: boolean) => {
  if (value) transition.hide(() => {
    show.value = false
  })
  else {
    show.value = true
    transition.show()
  }
});

function showSidebar() {
  pubSub.emit('toggle-sidebar', true)
}

</script>

<style>
.sidebarToggle-enter-active,
.sidebarToggle-leave-active {
  transition: opacity 0.5s;
}

.sidebarToggle-enter-from,
.sidebarToggle-leave-to {
  opacity: 0;
}
</style>
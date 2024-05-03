<template>
  <div class="h-screen font-Roboto bg-white flex">
    <!-- <Transition name="sidebartr">
      <Sidebar v-show="showSidebar" />
    </Transition> -->
    <div class="h-full w-full overflow-x-clip flex flex-col transition-all">
      <Navbar />
      <div class="p-2 h-full overflow-y-auto">
        <!-- <Editor/> -->
        <Querier/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { Querier, Navbar } from '@components'

import { ref } from 'vue'
import { PubSub } from '@src/pubSub'
const pubSub = PubSub.getInstance()

/*
const showSidebar = ref(true)

pubSub.subscribe("sidebar-toggle-end", (show: boolean) => {
  if (!show) showSidebar.value = false
})

pubSub.subscribe("sidebar-toggle-start", (show: boolean) => {
  if (!show) showSidebar.value = true
})
*/

document.body.onkeydown = (e: KeyboardEvent) => {
  if (e.code == "KeyS" && e.ctrlKey) {
    pubSub.emit("save-current-page")
  }
}

</script>
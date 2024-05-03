<template>
  <div class="h-screen font-Roboto bg-white flex">
    <!--<Transition name="sidebartr">
      <Sidebar v-show="showSidebar" />
    </Transition>-->
    <div class="h-full w-full overflow-x-clip flex flex-col transition-all">
      <!--<Navbar />-->
      <div class="p-2 h-full overflow-y-auto">
        <!--<Editor/>-->
        <!--<Querier v-if="showQuerier" />-->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

//import { Editor, Navbar, Sidebar, Querier } from '@components'

import { ref } from 'vue'
import { PubSub } from '@src/pubSub'
const pubSub = PubSub.getInstance()

const showSidebar = ref(true)
const showQuerier = ref(false)

pubSub.subscribe("toggle-querier", () => {
  showQuerier.value = !showQuerier.value
})

pubSub.subscribe("set-sidebar", (show: boolean) => {
  showSidebar.value = show
})

document.body.onkeydown = (e: KeyboardEvent) => {
  if (e.code == "KeyS" && e.ctrlKey) {
    pubSub.emit("save-current-page")
  }
}

</script>
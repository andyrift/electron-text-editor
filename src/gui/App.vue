<template>
  <div class="h-screen font-Roboto bg-white flex">
    <Sidebar />
    <div class="h-full w-full overflow-x-clip flex flex-col transition-all">
      <Navbar />
      <Toolbar />
      <div class="h-full overflow-y-auto">
        <Editor />
        <Querier />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { Querier, Navbar, Toolbar, Sidebar, Editor } from '@components'

import { PubSub } from '@src/pubSub'
const pubSub = PubSub.getInstance()

document.body.onkeydown = (e: KeyboardEvent) => {
  if (e.code == "KeyS" && e.ctrlKey) {
    pubSub.emit("save-current-page")
  }
}

</script>
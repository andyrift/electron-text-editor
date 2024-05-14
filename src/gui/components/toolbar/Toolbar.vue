<template>
  <div class="w-full h-8 bg-white flex items-center pl-3 flex-none whitespace-nowrap">
    <div class="grow"></div>
    <button class="hover:bg-zinc-200 rounded outline-none mr-1" @click="handleToggleMenu">
      <i class="fa-solid fa-ellipsis p-1"></i>
    </button>
    <Menu></Menu>
  </div>
</template>

<script setup lang="ts">
import Menu from "./Menu.vue"

import { PubSub } from "@src/pubSub"
const pubSub = PubSub.getInstance()

function handleToggleMenu() {
  pubSub.emit('toggle-toolbar-menu', true)
}

</script>
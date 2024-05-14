<template>
  <div class="w-full h-10 bg-white border-b border-zinc-300 flex items-center pl-3 flex-none whitespace-nowrap">
    <SidebarToggle />
    <div class="text-ellipsis mx-2 overflow-hidden w-full navbar-draggable">
      <span>{{ title || "Untitled" }}</span>
    </div>
    <div class="grow navbar-draggable"></div>
  </div>
</template>

<script setup lang="ts">

import SidebarToggle from "./SidebarToggle.vue"

import { ref } from 'vue'
import { PubSub } from "@src/pubSub"
const pubSub = PubSub.getInstance()

const title = ref<string | null>(null);
pubSub.subscribe("page-title-changed", (value: string | null) => {
  title.value = value
})

</script>

<style>
.navbar-draggable {
  -webkit-app-region: drag;
  -webkit-user-select: none;
  user-select: none;
}
</style>
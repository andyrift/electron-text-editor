<template>
  <div class="h-screen font-Roboto bg-white flex">
    <Transition name="sidebartr">
      <Sidebar v-show="showSidebar" />
    </Transition>
    <div class="h-full w-full overflow-x-clip flex flex-col transition-all">
      <Navbar />
      <div class="p-2 h-full overflow-y-auto">
        <Editor/>
        <Querier v-if="showQuerier" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref } from 'vue'

import { PubSub } from '@src/pubSub';
import { Core } from '@renderer/core';
import { Editor, Navbar, Sidebar, Querier } from '@components';

const showSidebar = ref(true);
const showQuerier = ref(false);

PubSub.subscribe("toggle-querier", () => {
  showQuerier.value = !showQuerier.value;
});

PubSub.subscribe("show-sidebar", () => {
  showSidebar.value = true;
});

PubSub.subscribe("hide-sidebar", () => {
  showSidebar.value = false;
});

const core = Core.getInstance();

const handleKey = (e: KeyboardEvent) => {
  if (e.code == "KeyS" && e.ctrlKey) {
    core.saveCurrentPage();
  }
}

document.body.onkeydown = handleKey;
</script>
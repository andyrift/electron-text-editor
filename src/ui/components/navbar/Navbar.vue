<template>
  <div class="w-full h-14 bg-white border-b border-gray-300 flex items-center pr-6 pl-5 flex-none">
    <Transition name="sidebarToggle">
      <SidebarToggle v-show="showArrow" />
    </Transition>
    <div class="text-xl whitespace-nowrap text-ellipsis overflow-hidden mx-2">
      <div>
        <i v-show="!title" class="fa-solid fa-home mr-3"></i>
        <span>{{ title || "Working Area" }}</span>
      </div>
    </div>
    <div class="grow"></div>
    <div class="flex-none overflow-y-auto">
      
    </div>
    <div class="grow"></div>
    <Menu></Menu>
  </div>
</template>

<script setup lang="ts">

import { SidebarToggle, Menu } from ".";

import { ref } from 'vue';
import { PubSub, Editor } from "@core";
const editor = Editor.getInstance();

const title = ref<string | null>(null);
editor.subscribeToTitleUpdate((value) => { title.value = value });

const showArrow = ref(false);

PubSub.subscribe('sidebar-shown', () => {
  showArrow.value = false;
});

PubSub.subscribe('sidebar-hidden', () => {
  showArrow.value = true;
});

</script>
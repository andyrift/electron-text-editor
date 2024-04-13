<template>
  <div :style="{ width: width + 'px' }" class="text-xl flex-none relative h-9">
      <div class="absolute right-0">
        <i class="h-9 flex-none fa-solid fa-angles-right cursor-pointer mr-1 hover:bg-gray-200 py-2 px-3 rounded"
          @click="pubSub.emit('show-sidebar')"></i>
      </div>
  </div>
</template>

<script setup lang="ts">
import { FixedSquaredTransition } from "@utils";
import { ref } from "vue";
import { PubSub } from "@core";
const pubSub = PubSub.getInstance();

const width = ref(40);

const transition = new FixedSquaredTransition((value) => {
  width.value = value
}, 0.5, 0, width.value, false);

width.value = 0;

pubSub.subscribe('sidebar-shown', () => {
  transition.hide()
});

pubSub.subscribe('sidebar-hidden', () => {
  transition.show()
});

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
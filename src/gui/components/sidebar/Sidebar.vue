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
      <div class="sidebar h-full py-1 px-2 overflow-y-auto bg-zinc-100">

      </div>
      <div class="border-t border-zinc-300">
        <!-- <TrashButton></TrashButton> -->
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">

// import PageButton from "./PageButton.vue";
// import PageFolder from "./PageFolder.vue";
// import TrashButton from "./TrashButton.vue";

import { ref } from "vue";
import { FixedSquaredTransition } from "@utils";
import { PubSub } from "@src/pubSub";

const pubSub = PubSub.getInstance();

const show = ref(true)
const width = ref(300);
const transitionWidth = ref(300);

const transition = new FixedSquaredTransition((value) => {
  transitionWidth.value = value
}, 0.5, 0, width.value);

pubSub.subscribe("toggle-sidebar-end", (value: boolean) => {
  if (!value) show.value = false
})

pubSub.subscribe("toggle-sidebar", (value: boolean) => {
  if (value) show.value = true
})

pubSub.subscribe("toggle-sidebar", (value: boolean) => {
  if (value) transition.show(() => {
    pubSub.emit('toggle-sidebar-end', true);
  })
  else transition.hide(() => {
    pubSub.emit('toggle-sidebar-end', false);
  })
})

// const handleDragover = (e: DragEvent) => {
//   e.preventDefault()
// }
// const handleDrop = (e: DragEvent) => {
//   e.stopPropagation()
//   if (e.dataTransfer && e.dataTransfer.getData('page')) {
//     let id = parseInt(e.dataTransfer.getData('page'));
//     if (id) {
//       //pageManager.changePageFolder(id, null);
//     }
//   }
// }

</script>

<style>

.fadequick-enter-active,
.fadequick-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}

.fadequick-enter-from,
.fadequick-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}

.transition-group {
  position: relative;
}

.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scaleY(0.9);
}

.fade-leave-active {
  position: absolute;
}
</style>
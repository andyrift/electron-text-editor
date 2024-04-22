<template>
  <div class="relative my-auto">
    <button class="hover:bg-gray-200 px-3 py-1 rounded outline-none" @click="showMenu = !showMenu">
      <i class="fa-solid fa-ellipsis"></i>
    </button>
    <div v-show="showMenu" class="fixed z-10 top-0 left-0 w-screen h-screen bg-black opacity-0"
      @click="showMenu = false">
    </div>
    <Transition name="fadeup">
      <div v-show="showMenu" class="absolute text-base right-0 z-20 bg-white pt-2 shadow-unilg mt-2 w-64 rounded-md border border-gray-300">
        <!--<div class="border-b-2 flex flex-col">
          <div class="text-lg py-1 px-4 mb-1">
            Normal Thingies
          </div>
        </div>-->
        <div class="border-b-2 flex flex-col">
          <div class="px-3 py-1.5 hover:bg-gray-200 cursor-pointer" @click="core.saveCurrentPage(); showMenu = false;">
            <i class="fa-solid fa-floppy-disk mr-2"></i> Save
          </div>
          <div class="px-3 py-1.5 hover:bg-gray-200 cursor-pointer" @click="core.deleteCurrentPage(); showMenu = false;">
            <i class="fa-solid fa-trash-can mr-2"></i> Delete
          </div>
          <div class="px-3 py-1.5 hover:bg-gray-200 cursor-pointer" @click="pubSub.emit('toggle-querier'); showMenu = false;">
            <i class="fa-solid fa-bug mr-2"></i> Toggle Querier
          </div>
        </div>
        <div class="p-2">
          <div
            class="w-fit h-fit bg-white flex-col text-sm font-normal text-gray-700 p-1 cursor-default">
            <div>
              Word Count: {{ editor.wordCounter.value.words }}
            </div>
            <div>
              Character Count: {{ editor.wordCounter.value.characters }}
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Core, Editor, PubSub } from "@core";
const core = Core.getInstance();
const editor = Editor.getInstance();
const pubSub = PubSub.getInstance();

const showMenu = ref(false);
</script>

<style>
.fadeup-enter-active,
.fadeup-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fadeup-enter-from,
.fadeup-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}
</style>
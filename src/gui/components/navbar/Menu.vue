<template>
  <div class="relative my-auto">
    <Veil :callback="() => { show = false}" :show="show"></Veil>
    <Transition name="fadeup">
      <div v-show="show"
        class="absolute text-base right-0 z-20 bg-white pt-2 shadow-unilg mt-2 w-64 rounded-md border border-gray-300">
        <div class="border-b-2 flex flex-col">
          <div class="px-3 py-1.5 hover:bg-gray-200 cursor-pointer" @click="show = false;">
            <i class="fa-solid fa-floppy-disk mr-2"></i> Save
          </div>
          <div class="px-3 py-1.5 hover:bg-gray-200 cursor-pointer" @click="show = false;">
            <i class="fa-solid fa-trash-can mr-2"></i> Delete
          </div>
          <div class="px-3 py-1.5 hover:bg-gray-200 cursor-pointer"
            @click="pubSub.emit('toggle-querier'); show = false;">
            <i class="fa-solid fa-bug mr-2"></i> Toggle Querier
          </div>
        </div>
        <div class="p-2">
          <div class="w-fit h-fit bg-white flex-col text-sm font-normal text-gray-700 p-1 cursor-default">
            <div>
              Word Count: {{ null }}
            </div>
            <div>
              Character Count: {{ null }}
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">

import { Veil } from '@components'

import { ref } from 'vue'
import { PubSub } from "@src/pubSub"
const pubSub = PubSub.getInstance()

const show = ref(false)

pubSub.subscribe("toggle-navbar-menu", (value: boolean) => {
  show.value = value
})

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
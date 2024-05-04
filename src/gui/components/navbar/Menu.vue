<template>
  <div class="relative my-auto">
    <Veil :callback="() => { show = false}" :show="show"></Veil>
    <Transition name="fadeup">
      <div v-show="show"
        class="absolute right-0 top-6 z-20 bg-white shadow-unilg w-52 rounded-md border border-zinc-300">
        <div class="text-sm border-b-2 flex flex-col p-1">
          <div class="px-2 py-1 hover:bg-zinc-200 cursor-pointer rounded" @click="show = false;">
            <i class="fa-solid fa-floppy-disk mr-2"></i> Save
          </div>
          <div class="px-2 py-1 hover:bg-zinc-200 cursor-pointer rounded" @click="show = false;">
            <i class="fa-solid fa-trash-can mr-2"></i> Delete
          </div>
          <div class="px-2 py-1 hover:bg-zinc-200 cursor-pointer rounded"
            @click="pubSub.emit('toggle-querier'); show = false;">
            <i class="fa-solid fa-bug mr-2"></i> Toggle Querier
          </div>
        </div>
        <div class="py-1 px-3">
          <div class="w-fit h-fit bg-white flex-col text-xs font-normal text-zinc-500 cursor-default">
            <div>
              Word Count: {{ null || 0 }}
            </div>
            <div>
              Character Count: {{ null || 0 }}
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
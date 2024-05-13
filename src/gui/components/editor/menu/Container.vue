<template>
  <div style="z-index: 7;" :style="positionStyle"
    class="select-none text-sm whitespace-nowrap shadow-unilg text-gray-800 flex-none min-w-40 rounded-md"
    @click="(e) => { e.stopPropagation() }">
    <div class="bg-white rounded-md divide-y divide-gray-300 border border-gray-300 relative">
      <slot>

      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const left = ref(0)
const top = ref(0)

const positionStyle = computed(() => {
  return {
    top: top.value + 'px',
    left: left.value + 'px',
  }
})

const setPos = (l: number, t: number) => {
  left.value = l
  top.value = t
}

defineExpose({
  setPos
})
</script>
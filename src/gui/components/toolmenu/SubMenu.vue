<template>
  <div style="z-index: 7;" :style="style" class="whitespace-nowrap shadow-unilg absolute rounded-md border border-gray-300 bg-white min-w-40 divide-y divide-gray-300"  @click="(e) => {e.stopPropagation()}">
    <slot>

    </slot>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const left = ref(0);
const top = ref(0);

const style = computed(() => {
  return {
    top: top.value + 'px',
    left: left.value + 'px',
  };
});

const setPos = (l: number, t: number) => {
  left.value = l;
  top.value = t;
}

defineExpose({
  setPos
})
</script>
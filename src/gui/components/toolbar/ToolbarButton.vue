<template>
  <button
    class="w-10 border-2 p-1 border-gray-300 hover:bg-gray-100 active:bg-gray-200 disabled:text-gray-300"
    :class="buttonActiveClass, buttonDirectionClass" :disabled="!props.available">
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ButtonDirection } from "@components"

const props = defineProps<{
  active?: Boolean,
  available?: Boolean,
  direction: ButtonDirection
}>();

const buttonActiveClass = computed(() => {
  return props.active ? 'bg-gray-200' : '';
});
const buttonDirectionClass = computed(() => {
  if (props.direction == ButtonDirection.Right) {
    return "border-l rounded-r";
  }
  else if (props.direction == ButtonDirection.Left) {
    return "border-r rounded-l";
  }
  return "border-x rounded-none";
})
</script>
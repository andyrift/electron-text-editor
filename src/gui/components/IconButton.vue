<template>
  <button :class="hover ? 'opacity-30 hover:opacity-100' : 'opacity-0'" class="ml-1 transition-opacity h-fit outline-none" @click="handleClick">
    <slot>
      <i class="fa-solid fa-wrench"></i>
    </slot>
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  hover?: boolean,
  stopProp?: boolean,
  newOnClick?: (e?: MouseEvent) => void
}>(), {
  hover: true,
  stopProp: true,
})

const emit = defineEmits<{
  clickbutton: [e: MouseEvent]
}>()

const handleClick = (e: MouseEvent) => {
  if (props.stopProp) e.stopPropagation()
  if (props.newOnClick) props.newOnClick(e)
  emit("clickbutton", e)
}
</script>
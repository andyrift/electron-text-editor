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
  onClick?: (e?: MouseEvent) => void
}>(), {
  hover: true,
  stopProp: true,
})

const handleClick = (e: MouseEvent) => {
  if (props.stopProp) e.stopPropagation()
  if (props.onClick) props.onClick(e)
}
</script>
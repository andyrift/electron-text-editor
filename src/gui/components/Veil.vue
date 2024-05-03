<template>
  <div v-if="_show || show" class="fixed z-10 top-0 left-0 w-screen h-screen bg-black opacity-0"
    @click="handleClick">
  </div>
</template>

<script setup lang="ts">

import { Ref, ref, watch } from 'vue'

const _show = ref(false)

const props = defineProps<{
  show?: boolean
  showRef?: Ref<boolean>,
  callback?: ((e?: MouseEvent) => void)
}>()

if (props.showRef) {
  watch(props.showRef, () => {
    if (props.showRef) {
      _show.value = props.showRef.value
    }
  })
}

let callback : null | ((e? : MouseEvent) => void) = props.callback || null

const doShow = (cb: (e?: MouseEvent) => void) => {
  _show.value = true
  callback = cb
}

const doHide = () => {
  _show.value = false
}

defineExpose({
  doShow,
  doHide
})

function handleClick (e: MouseEvent) { 
  e.stopPropagation(); 
  _show.value = false; callback && callback(e) 
}

</script>
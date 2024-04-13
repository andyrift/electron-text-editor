<template>
  <div class="max-w-3xl mx-auto" @contextmenu="contextmenu">
    <div ref="editorEl" class="border my-3 p-4"></div>
  </div>
  <Transition name="fadetool">
    <Toolbar :style="style" v-show="show" id="toolbar" class="fixed" />
  </Transition>
</template>

<script setup lang="ts">

import { PubSub, Editor } from "@core";
import { Toolbar } from "@components";

import { computed, nextTick, ref } from "vue";
const editor = Editor.getInstance();

const editorEl = ref<Element | null>(null);
editor.useView(editorEl);

const show = ref(false);

const left = ref(0);
const top = ref(0);

const style = computed(() => {
  return {
    top: top.value + 'px',
    left: left.value + 'px',
  };
});

PubSub.subscribe('hide-toolbar', () => {
  show.value = false;
})

editor.subscribeToUpdate(() => {
  show.value = false;
})

document.body.addEventListener('click', () => {
  show.value = false;
})

const contextmenu = async (e: MouseEvent) => {
  e.preventDefault();

  if (show.value) {
    show.value = false;
    return
  }

  show.value = true;
  await nextTick();

  let toolbar = document.getElementById('toolbar');
  if (!toolbar) return;

  let offsetRight = toolbar.clientWidth * 2 / 3;
  let offsetLeft = toolbar.clientWidth / 3;

  if (e.pageX - offsetLeft < 0) {
    left.value = 8
  } else if (e.pageX + offsetRight > document.body.clientWidth) {
    left.value = document.body.clientWidth - 8 - toolbar.clientWidth
  } else {
    left.value = e.pageX - toolbar.clientWidth / 3
  }

  top.value = e.pageY - 24 - toolbar.clientHeight
}

</script>

<style>
.fadetool-enter-active,
.fadetool-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fadetool-enter-from,
.fadetool-leave-to {
  opacity: 0;
  transform: scale(0.99);
}
</style>
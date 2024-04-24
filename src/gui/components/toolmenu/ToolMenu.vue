<template>
  <Transition name="fadetool">
    <Tools :style="style" v-show="show" />
  </Transition>
</template>

<script setup lang="ts">
import { PubSub } from "@src/pubSub";
import { Editor } from "@editor";
import { computed, nextTick, ref } from 'vue';
import Tools from './Tools.vue'

const pubSub = PubSub.getInstance(); 
const editor = Editor.getInstance();

const style = computed(() => {
  return {
    top: top.value + 'px',
    left: left.value + 'px',
  };
});

const show = ref(false);

const left = ref(0);
const top = ref(0);

const showMenu = async (e: MouseEvent) => {
  show.value = true;
  await nextTick();

  let toolbar = document.getElementById('toolbar');
  if (!toolbar) return;

  if (e.pageX + toolbar.clientWidth > document.body.clientWidth) {
    if (e.pageX - toolbar.clientWidth < 0) {
      left.value = document.body.clientWidth - toolbar.clientWidth;
    } else {
      left.value = e.pageX - toolbar.clientWidth;
    }
  } else {
    left.value = e.pageX;
  }

  if (e.pageY + toolbar.clientHeight > document.body.clientHeight) {
    if (e.pageY - toolbar.clientHeight < 0) {
      top.value = document.body.clientHeight - toolbar.clientHeight;
    } else {
      top.value = e.pageY - toolbar.clientHeight;
    }
  } else {
    top.value = e.pageY;
  }
  
}

const hideMenu = () => {
  show.value = false;
}

pubSub.subscribe('editor-context', (e: MouseEvent) => {
  if (show.value) hideMenu();
  else showMenu(e);
})

pubSub.subscribe('hide-toolbar', () => {
  hideMenu()
})

editor.subscribeToUpdate(() => {
  pubSub.emit('hide-toolbar')
})

document.body.addEventListener('click', () => {
  pubSub.emit('hide-toolbar')
})
</script>
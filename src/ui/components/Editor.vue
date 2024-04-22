<template>
  <div ref="relative" class="max-w-4xl mx-auto relative" @contextmenu="contextmenu">
    <div ref="editorEl" class="border my-3 p-12 relative" @mousemove="mousemove"></div>
    <template v-for="rect in rectangles" :key="rect.pos">
      <Transition name="draghandle">
        <div v-show="curpos.includes(rect.pos)" :style="{ zIndex: 7, top: rect.top + 'px', left: rect.left - 20 + 'px', width: 16 + 'px', height: 16 + 'px' }" 
          class="absolute bg-opacity-40 bg-zinc-500 cursor-pointer rounded" draggable="true" 
          @dragstart="dragStart($event, rect.pos)" @mousedown="mouseDown($event, rect.pos)" @click="handleClick($event, rect.pos)"> 
        </div>
      </Transition>
    </template>

    <div v-show="false" v-for="rect in rectangles" :style="{ top: rect.top + 'px', left: rect.left - 20 + 'px', width: rect.width + 20 + 'px', height: rect.height + 'px' }" 
    class="absolute bg-opacity-10 bg-red-400 border border-blue-600 pointer-events-none" >
    
    </div>
  </div>
 
  
  
  <ToolMenu />
  <PageLinkPicker />
</template>

<script setup lang="ts">

import { NodeSelection } from "prosemirror-state";

import PageLinkPicker from './PageLinkPicker.vue'

import { PubSub, Editor } from "@core";
import { ToolMenu } from "@components";

import { ref, watch } from "vue";
const editor = Editor.getInstance();
const pubSub = PubSub.getInstance();

const rectangles = ref<any[]>([])
const relative = ref<Element | null>(null);
const editorEl = ref<Element | null>(null);
editor.useView(editorEl);

const curpos = ref<number[]>([])

const mousemove = (e: MouseEvent) => {
  if (!relative.value) return
  let offset = relative.value.getBoundingClientRect()
  curpos.value = [];
  let pos = -1;
  rectangles.value.forEach(rect => {
    if (rect.left - 20 < e.pageX - offset.left && 
    rect.top < e.pageY - offset.top && 
    rect.left + rect.width > e.pageX - offset.left && 
    rect.top + rect.height > e.pageY - offset.top) {
      pos = rect.pos;
    }
  })
  curpos.value.push(pos)
}

watch(editor.rectangles, () => {
  if(!relative.value) return
  rectangles.value = []
  let offset = relative.value.getBoundingClientRect()
  editor.rectangles.value.forEach(rect => {
    let r = {
      top: rect.top - offset.top,
      left: rect.left - offset.left,
      width: rect.width,
      height: rect.height,
      pos: rect.pos
    }
    rectangles.value.push(r);
  })
})

const contextmenu = async (e: MouseEvent) => {
  e.preventDefault();
  pubSub.emit('editor-context', e);
}

const dragStart = (e: DragEvent, pos: number) => {
  if (e.dataTransfer && pos) {
    e.dataTransfer.setData('pos', pos.toString());
  }
}

const handleClick = (e: MouseEvent, pos: number) => {
  if (pos && editor.view) {
    e.preventDefault()
    editor.view.focus()
    editor.view.dispatch(editor.view.state.tr.setSelection(NodeSelection.create(editor.view.state.doc, pos)))
  }
}

const mouseDown = (e: MouseEvent, pos: number) => {
  if (pos && editor.view) {
    editor.view.focus()
    editor.view.dispatch(editor.view.state.tr.setSelection(NodeSelection.create(editor.view.state.doc, pos)))
  }
}

</script>

<style>
.fadetool-enter-active,
.fadetool-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}

.fadetool-enter-from,
.fadetool-leave-to {
  opacity: 0;
  transform: scale(0.99);
}

.draghandle-leave-active {
  transition: opacity 0.5s ease;
}

.draghandle-enter-active {
  transition: opacity 0s;
}

.draghandle-enter-from,
.draghandle-leave-to {
  opacity: 0;
}
</style>
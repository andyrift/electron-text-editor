<template>
  <div @click="pubSub.emit('toggle-editor-context-menu', false)" ref="containerElement"
    class="max-w-3xl h-full mx-auto relative" @contextmenu="handleContextMenu">
    <div class="p-4 mt-8">
      <div ref="editorElement" class="relative" @mousemove="handleMouseMove"></div>
      <div class="h-64 cursor-text" @click="handleClickUnderEditor"></div>
      <template v-for="rect in rectangles" :key="rect.pos">
        <Transition name="draghandle">
          <div v-show="curpos.includes(rect.pos)"
            :style="{ zIndex: 7, top: rect.top + 'px', left: rect.left - 20 + 'px', width: 16 + 'px', height: 16 + 'px' }"
            class="absolute bg-opacity-40 bg-zinc-500 cursor-pointer rounded" draggable="true"
            @dragstart="handleDragStart($event, rect.pos)" @mousedown="handleMouseDown($event, rect.pos)"
            @click="handleClick($event, rect.pos)" @mouseleave="handleMouseLeave($event, rect.pos)">
          </div>
        </Transition>
      </template>
      <div v-if="false" v-for="rect in rectangles"
        :style="{ top: rect.top + 'px', left: rect.left - 20 + 'px', width: rect.width + 20 + 'px', height: rect.height + 'px' }"
        class="absolute bg-opacity-10 bg-red-400 border border-blue-600 pointer-events-none">
      </div>
    </div>
  </div>
  <Menu :menuState="editor.getMenuState()"></Menu>
</template>

<script setup lang="ts">

import { PubSub } from "@src/pubSub"
import { useEditor } from "@src/editor"
import Menu from "./menu/Menu.vue";

import { ref, watch } from "vue"

const containerElement = ref<HTMLElement | null>(null);
const editorElement = ref<HTMLElement | null>(null)
const editor = useEditor(editorElement)

const pubSub = PubSub.getInstance()

async function handleContextMenu(e: MouseEvent) {
  e.preventDefault()
  pubSub.emit("toggle-editor-context-menu", true, e)
}

function handleClickUnderEditor() {
  pubSub.emit("click-under-editor")
}

const positionState = editor.getPositionState()
const rectangles = ref<any[]>([])

const curpos = ref<number[]>([])

watch(positionState.positions, () => {
  if (!containerElement.value) return
  rectangles.value = []
  let offset = containerElement.value.getBoundingClientRect()
  positionState.positions.value.forEach(rect => {
    rectangles.value.push({
      top: rect.top - offset.top,
      left: rect.left - offset.left,
      width: rect.width,
      height: rect.height,
      pos: rect.pos
    })
  })
})

function handleMouseMove (e: MouseEvent) {
  if (!containerElement.value) return
  const offset = containerElement.value.getBoundingClientRect()
  curpos.value = [];
  var pos = -1;
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

function handleMouseLeave(e: MouseEvent, pos: number) {
  curpos.value = curpos.value.filter((item) => {return item != pos })
}

function handleDragStart (e: DragEvent, pos: number) {
  if (e.dataTransfer && pos) {
    e.dataTransfer.setData('drag-target-node-pos', pos.toString());
  }
}

function handleClick (e: MouseEvent, pos: number) {
  e.preventDefault()
  editor.focus()
  editor.selectNodeAtPos(pos)
}

function handleMouseDown (e: MouseEvent, pos: number) {
  editor.focus()
  editor.selectNodeAtPos(pos)
}

</script>

<style>
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
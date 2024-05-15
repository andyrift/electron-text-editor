<template>
  <Transition name="fadetool">
    <Content ref="content" v-show="show" :menuState="menuState"/>
  </Transition>
</template>

<script setup lang="ts">
import { PubSub } from "@src/pubSub"
import { MenuState } from "@editor"
import { computed, nextTick, ref } from 'vue'

import Content from "./Content.vue"

const pubSub = PubSub.getInstance();

const props = defineProps<{
  menuState: MenuState
}>()

const show = ref(false);

const content = ref<InstanceType<typeof Content> | null>(null)

type Position = {
  pageX: number,
  pageY: number,
}

const showMenu = async (pos: Position) => {
  show.value = true;
  await nextTick();

  if (!content.value) return;

  const width = content.value.$el.clientWidth
  const height = content.value.$el.clientHeight

  const windowWidth = document.body.clientWidth
  const windowHeight = document.body.clientHeight

  const x = pos.pageX
  const y = pos.pageY

  let left = x
  let top = y

  if (x + width > windowWidth) {
    if (x - width < 0) {
      left = windowWidth - width;
    } else {
      left = x - width;
    }
  }

  if (y + height > windowHeight) {
    if (y - height < 0) {
      top = windowHeight - height;
    } else {
      top = y - height;
    }
  }

  content.value.setPos(left, top)
}

const hideMenu = () => {
  show.value = false
}

pubSub.subscribe('toggle-editor-context-menu', (value: boolean, e?: MouseEvent) => {
  if (value && e) showMenu({ pageX: e.pageX, pageY: e.pageY })
  else if (value) showMenu({ pageX: 0, pageY: 0 })
  else hideMenu()
})
</script>
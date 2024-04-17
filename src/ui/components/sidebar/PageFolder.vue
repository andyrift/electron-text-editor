<template>
  <div class="text-gray-700 shadow-uni bg-white"
    @drop="handleDrop" @dragover="handleDragover"
    :class="pageManager.folderContents.value[id].length == 0 ? 'text-opacity-50' : ''">
    <div class="px-4 py-2 flex" @mouseenter="hover = true" @mouseleave="hover = false">
      <div class="cursor-pointer grow select-none whitespace-nowrap text-ellipsis overflow-hidden" @click="toggleOpen">
        <i class="fa-solid fa-folder mr-3"></i>
        <span>{{ input || "Unnamed" }}</span>
      </div>
      <button :class="hover ? 'opacity-30 hover:opacity-100' : 'opacity-0'" class=" ml-1 transition-opacity
        h-fit outline-none" @click="(e) => { e.stopPropagation(); pageManager.deleteFolder(id) }">
        <i class="fa-solid fa-trash-can"></i>
      </button>
      <div class="w-2 flex-none"></div>
      <div class="relative">
        <button :class="hover ? 'opacity-30 hover:opacity-100' : 'opacity-0'"
          class="transition-opacity ml-1 h-fit outline-none" @click="(e) => { e.stopPropagation(); toggleRename() }">
          <i class="fa-solid fa-pen"></i>
        </button>
        <div v-if="showRename" class="fixed z-10 top-0 left-0 w-screen h-screen bg-black opacity-0"
          @click="showRename = false; hover = false; updateInput()">
        </div>
        <Transition name="fadequick">
          <div v-if="showRename" class="absolute right-0 z-20 bg-white p-2 shadow-unilg mt-2 rounded flex items-center">
            <input ref="inp" v-model="input" class="border-2 border-gray-300 rounded p-1 
          outline-none" type="text" @keydown="(e: KeyboardEvent) => { if (e.key == 'Enter') save() }"></input>
            <i class="rounded mx-1 p-1 text-xl fa-solid fa-check opacity-30 hover:opacity-100 transition-opacit cursor-pointer"
              @click="save"></i>
          </div>
        </Transition>
      </div>
    </div>
    <div :style="{ height: height + 'px' }" class="relative" :class="transitioning ? 'overflow-hidden' : ''">
      <div ref="content" v-if="show" class="absolute bottom-0 w-full">
        <div class="ml-2 px-2 border-l-2 border-l-gray-300 mb-2">
          <slot name="pages">
            Empty
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PageManager, PubSub } from '@core';
import { nextTick, ref, watch } from 'vue';
import { FixedSquaredTransition } from '@utils';

const height = ref(0);

const hover = ref(false);
const showRename = ref(false);

const content = ref();

let transition: FixedSquaredTransition | null = null;

const props = defineProps<{
  id: number,
  open?: boolean
}>();

const open = ref(false);
const show = ref(false);
const transitioning = ref(false);

const pageManager = PageManager.getInstance();

const input = ref<string | null>(null);
const inp = ref<any>(null);

watch(pageManager.folderContents, async () => {
  if (open.value && content.value) {
    await nextTick();
    height.value = content.value.clientHeight;
    transition = new FixedSquaredTransition(value => { height.value = value }, 0.3, 0, height.value, true);
  }
});

PubSub.subscribe('change-folder', async (folderid: any) => {
  if (props.id == folderid) {
    await nextTick();
    if (!open.value) toggleOpen();
  }
})

PubSub.subscribe('remove-from-folder', async (folderid: any) => {
  if (props.id == folderid) {
    if (open.value && pageManager.folderContents.value[folderid].length == 1) toggleOpen();
  }
})

const toggleOpen = async () => {
  open.value = !open.value;
  if(open.value) {
    show.value = true;
    await nextTick();
    if(content.value) {
      transitioning.value = true;
      transition = new FixedSquaredTransition(value => { height.value = value }, 0.3, 0, content.value.clientHeight, false);
      transition.show(() => { transitioning.value = false; });
    }
  } else {
    if (content.value && transition) {
      transitioning.value = true;
      transition.hide(() => { show.value = false; transitioning.value = false; });
    }
  }
}

const updateInput = () => {
  let folder = pageManager.foldersDict.value.get(props.id);
  if (folder) input.value = folder.name;
}

updateInput();

watch(pageManager.folders, updateInput);

const toggleRename = async () => {
  showRename.value = true;
  await nextTick();
  if (inp.value) inp.value.focus();
}

const save = () => {
  showRename.value = false;
  hover.value = false;
  PageManager.getInstance().renameFolder(props.id, input.value).then(status => {
    if (!status) updateInput();
  });
}

const handleDragover = (e: DragEvent) => {
  e.preventDefault()
}

const handleDrop = (e: DragEvent) => {
  e.stopPropagation()
  if (e.dataTransfer && e.dataTransfer.getData('page')) {
    let id = parseInt(e.dataTransfer.getData('page'));
    if (id && props.id) {
      pageManager.changeFolder(id, props.id);
    }
  }
}

</script>

<style>
.folder-enter-active,
.folder-leave-active {
  transition: transform 0.5s ease;
}

.folder-enter-from,
.folder-leave-to {
  transform:scaleY(0.01);
}
</style>
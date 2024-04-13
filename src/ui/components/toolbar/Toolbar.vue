<template>
  <div class="flex gap-4 items-center text-lg">
    <div class="flex bg-white shadow-lg rounded">
      <ToolbarButton :active="states['paragraph'].node"
        :available="states['paragraph'].node || commandState('paragraph').value"
        :direction="ButtonDirection.Left" @click="executeCommand($event, 'paragraph')" title="Normal text">
        <i class="fa-solid fa-paragraph"></i>
      </ToolbarButton>
      <ToolbarButton :active="states['h1'].node"
        :available="states['h1'].node || commandState('h1').value" :direction="ButtonDirection.Center"
        @click="executeCommand($event, 'h1')" title="Heading 1">
        <div class="font-bold">H1</div>
      </ToolbarButton>
      <ToolbarButton :active="states['h2'].node"
        :available="states['h2'].node || commandState('h2').value" :direction="ButtonDirection.Center"
        @click="executeCommand($event, 'h2')" title="Heading 2">
        <div class="font-bold">H2</div>
      </ToolbarButton>
      <ToolbarButton :active="states['h3'].node"
        :available="states['h3'].node || commandState('h3').value" :direction="ButtonDirection.Center"
        @click="executeCommand($event, 'h3')" title="Heading 3">
        <div class="font-bold">H3</div>
      </ToolbarButton>
      <ToolbarButton :active="states['code_block'].node"
        :available="states['code_block'].node || commandState('code_block').value"
        :direction="ButtonDirection.Right" @click="executeCommand($event, 'code_block')" title="Code Block">
        <i class="fa-solid fa-code"></i>
      </ToolbarButton>
    </div>
    <div class="flex bg-white shadow-lg rounded">
      <ToolbarButton :active="states['ul'].node" :available="commandState('ul').value"
        :direction="ButtonDirection.Left" @click="executeCommand($event, 'ul')" title="Bullet List">
        <i class="fa-solid fa-list-ul"></i>
      </ToolbarButton>
      <ToolbarButton :active="states['ol'].node" :available="commandState('ol').value"
        :direction="ButtonDirection.Center" @click="executeCommand($event, 'ol')" title="Ordered List">
        <i class="fa-solid fa-list-ol"></i>
      </ToolbarButton>
      <ToolbarButton :active="false" :available="false" :direction="ButtonDirection.Center" @click="" title="Check List">
        <i class="fa-solid fa-list-check"></i>
      </ToolbarButton>
      <ToolbarButton :active="false" :available="commandState('outdent').value" :direction="ButtonDirection.Center"
        @click="executeCommand($event, 'outdent')" title="Outdent">
        <i class="fa-solid fa-outdent"></i>
      </ToolbarButton>
      <ToolbarButton :active="false" :available="commandState('indent').value" :direction="ButtonDirection.Right"
        @click="executeCommand($event, 'indent')" title="Indent">
        <i class="fa-solid fa-indent"></i>
      </ToolbarButton>

    </div>
    <div class="flex bg-white shadow-lg rounded">
      <ToolbarButton :active="markState('bold').value" :available="commandState('bold').value"
        :direction="ButtonDirection.Left" @click="executeCommand($event, 'bold')" title="Toggle bold">
        <i class="fa-solid fa-bold"></i>
      </ToolbarButton>
      <ToolbarButton :active="markState('italic').value" :available="commandState('italic').value"
        :direction="ButtonDirection.Center" @click="executeCommand($event, 'italic')" title="Toggle italic">
        <i class="fa-solid fa-italic"></i>
      </ToolbarButton>
      <ToolbarButton :active="markState('underline').value" :available="commandState('underline').value"
        :direction="ButtonDirection.Center" @click="executeCommand($event, 'underline')" title="Toggle underline">
        <i class="fa-solid fa-underline"></i>
      </ToolbarButton>
      <ToolbarButton :active="markState('strikethrough').value" :available="commandState('strikethrough').value"
        :direction="ButtonDirection.Center" @click="executeCommand($event, 'strikethrough')"
        title="Toggle strikethrough">
        <i class="fa-solid fa-strikethrough"></i>
      </ToolbarButton>
      <ToolbarButton :active="markState('code').value" :available="commandState('code').value"
        :direction="ButtonDirection.Right" @click="executeCommand($event, 'code')" title="Toggle code">
        <i class="fa-solid fa-code"></i>
      </ToolbarButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Editor, PubSub } from "@core";
import { ButtonDirection, ToolbarButton } from "@components"

const pubsub = PubSub.getInstance();
const editor = Editor.getInstance();

const commands = editor.menu.buttons;
const states = editor.menu.states.value;

const executeCommand = (e : Event, command : string) => {
  e.preventDefault();
  pubsub.emit('hide-toolbar');
  commands.value[command]();
}

const commandState = (key: string) => {
  return computed(() => {
    return (states[key].applicable);
  })
}

const markState = (key: string) => {
  return computed(() => {
    return (states[key].mark);
  })
}
</script>
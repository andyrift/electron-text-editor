<template>
  <div v-if="show">
    <div class="text-xl font-normal mb-2">
      <i class="fa-solid fa-database mx-1"></i>
      <span>
        SQL Query Input
      </span>
    </div>
    <h1 class=""></h1>
    <div class="flex flex-col gap-2">
      <input class="border-2 border-zinc-300 rounded p-1
            focus:outline-none focus:shadow-uni transition-shadow" type="text" @keydown="key_down"
        v-model="input"></input>
      <div class="flex gap-2">
        <BetterButton :class="buffered_command == run ? 'outline outline-1 outline-app-secondary' : 'outline-none'"
          @click="run_query(null, run)">
          run
        </BetterButton>
        <BetterButton :class="buffered_command == get ? 'outline outline-1 outline-app-secondary' : 'outline-none'"
          @click="run_query(null, get)">
          get
        </BetterButton>
        <BetterButton :class="buffered_command == all ? 'outline outline-1 outline-app-secondary' : 'outline-none'"
          @click="run_query(null, all)">
          all
        </BetterButton>
        <BetterButton @click="backward" title="Go back in history">
          <i class="fa-solid fa-rotate-left"></i>
        </BetterButton>
        <BetterButton @click="forward" title="Go forward in history">
          <i class="fa-solid fa-rotate-right"></i>
        </BetterButton>
        <BetterButton @click="clear_history" title="Delete query history">
          <i class="fa-solid fa-trash-can"></i>
        </BetterButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { BetterButton } from "@components"
import { DBResponse } from "@src/database/model"

import { ref } from 'vue'

import { PubSub } from '@src/pubSub'
const pubSub = PubSub.getInstance()

const show = ref(false)

pubSub.subscribe("toggle-querier", () => {
  show.value = !show.value
})

const input = ref("")

const key_down = async (e: KeyboardEvent) => {
  if (e.key == "Enter") {
    e.preventDefault()
    run_query(e.target, buffered_command.value)
  } else if (e.key == "ArrowUp") {
    e.preventDefault()
    backward()
  } else if (e.key == "ArrowDown") {
    e.preventDefault()
    forward()
  }
  if (e.key == "ArrowRight" && e.altKey) {
    e.preventDefault()
    if (buffered_command.value == run) {
      buffered_command.value = get
    } else if (buffered_command.value == get) {
      buffered_command.value = all
    }
  }
  if (e.key == "ArrowLeft" && e.altKey) {
    e.preventDefault()
    if (buffered_command.value == all) {
      buffered_command.value = get
    } else if (buffered_command.value == get) {
      buffered_command.value = run
    }
  }
}

const log_output = (output: DBResponse<any>) => {
  if (output.status) {
    try {
      console.log(JSON.stringify(output.value, null, 2))
    } catch {
      console.log(console.log(output.value))
    }
  } else {
    console.log(output.value)
  }
}

const run = async (query: string) => { 
  log_output(await window.invoke("db:run", query))
}
const get = async (query: string) => {
  log_output(await window.invoke("db:get", query))
}
const all = async (query: string) => {
  log_output(await window.invoke("db:all", query))
}

var current_command = -1

const run_query = (target: EventTarget | null, command: typeof run) => {
  buffered_command.value = command
  const query = input.value
  input.value = ''
  const last = history[history.length - 1]
  if (query.length > 0 && (history.length == 0 || last && (query != last.query || command != last.command))) {
    history.push({ query, command })
  }
  current_command = -1
  command(query)
  if (target instanceof HTMLElement) target.focus()
}

const backward = async () => {
  if (history.length == 0) return
  if (current_command == -1) {
    current_command = history.length - 1
  } else if (current_command > 0) {
    current_command -= 1
  }
  const current = history[current_command]
  if (!current) return
  input.value = current.query
  buffered_command.value = current.command
}

const forward = async () => {
  if (history.length == 0) return
  if (current_command != -1) {
    if (current_command < history.length - 1) {
      current_command += 1
      const current = history[current_command]
      if (!current) return
      input.value = current.query
      buffered_command.value = current.command
    } else {
      current_command = -1
      input.value = ''
    }
  }
}

const clear_history = () => {
  history = []
  current_command = -1
}

var buffered_command = ref(run)
var history: { query: string, command: typeof run} [] = []

</script>
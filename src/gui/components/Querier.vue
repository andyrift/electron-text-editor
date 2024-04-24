<template>
  <div class="text-xl font-normal mb-2">
    <i class="fa-solid fa-database mx-1"></i>
    <span>
      SQL Query Input
    </span>
  </div>
  <h1 class=""></h1>
  <div class="flex flex-col gap-2">
    <input ref="inp" class="border-2 border-gray-300 rounded p-1 
          focus:outline-none focus:shadow-uni transition-shadow" type="text" @keydown="key_down"></input>
    <div class="flex gap-2">
      <BetterButton :class="buffered_command == run ? 'outline outline-1 outline-app-secondary' : 'outline-none'"
        @click="run_query(run)">
        run
      </BetterButton>
      <BetterButton :class="buffered_command == get ? 'outline outline-1 outline-app-secondary' : 'outline-none'"
        @click="run_query(get)">
        get
      </BetterButton>
      <BetterButton :class="buffered_command == all ? 'outline outline-1 outline-app-secondary' : 'outline-none'"
        @click="run_query(all)">
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
</template>

<script setup>
import { BetterButton } from "@components";

import { ref } from 'vue'

const inp = ref(null)
const key_down = async (e) => {
  if (e.key == "Enter") {
    e.preventDefault();
    run_query(buffered_command.value);
  } else if (e.key == "ArrowUp") {
    e.preventDefault();
    backward();
  } else if (e.key == "ArrowDown") {
    e.preventDefault();
    forward();
  }
  if (e.key == "ArrowRight" && e.ctrlKey) {
    e.preventDefault();
    if (buffered_command.value == run) {
      buffered_command.value = get;
    } else if (buffered_command.value == get) {
      buffered_command.value = all;
    }
  }
  if (e.key == "ArrowLeft" && e.ctrlKey) {
    e.preventDefault();
    if (buffered_command.value == all) {
      buffered_command.value = get;
    } else if (buffered_command.value == get) {
      buffered_command.value = run;
    }
  }
}

const log_output = (output) => {
  if (output.status) {
    try {
      console.log(JSON.stringify(output.res, null, 2));
    } catch {
      console.log(console.log(output.res));
    }
  } else {
    console.log(output.err)
  }
}

const run = async (query) => { 
  log_output(await window.api.dbquery_run(query));
}
const get = async (query) => {
  log_output(await window.api.dbquery_get(query));
}
const all = async (query) => {
  log_output(await window.api.dbquery_all(query));
}

var current_command = -1;

const run_query = (command) => {
  buffered_command.value = command;
  const query = inp.value.value;
  inp.value.value = '';
  const last = history[history.length - 1];
  if (query.length > 0 && (history.length == 0 || query != last.query || command != last.command)) {
    history.push({ query, command });
  }
  current_command = -1;
  command(query);
  inp.value.focus();
}

const backward = async () => {
  if (history.length == 0) return;
  if (current_command == -1) {
    current_command = history.length - 1;
  } else if (current_command > 0) {
    current_command -= 1;
  }
  inp.value.value = history[current_command].query;
  buffered_command.value = history[current_command].command;
}

const forward = async () => {
  if (history.length == 0) return;
  if (current_command != -1) {
    if (current_command < history.length - 1) {
      current_command += 1;
      inp.value.value = history[current_command].query;
      buffered_command.value = history[current_command].command;
    } else {
      current_command = -1;
      inp.value.value = '';
    }
  }
}

const clear_history = () => {
  history = [];
  current_command = -1;
}

var buffered_command = ref(run);
var history = [];

</script>
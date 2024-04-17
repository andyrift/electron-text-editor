<template>
  <div id="toolbar" style="z-index: 7;" class="select-none fixed shadow-unilg text-gray-800 flex-none min-w-40 rounded-md" @click="(e) => {e.stopPropagation()}">
    <div class="bg-white rounded-md divide-y divide-gray-300 border border-gray-300 relative">
      <div class="p-1.5">
        <ToolsButton :available="false">
          <template v-slot:element>
            <i class="fa-solid fa-link mr-2"></i>
            <span>Add Link</span>
          </template>
        </ToolsButton>
      </div>
      <div class="p-1.5">
        <ToolsButton :chevron="true" ref="formatbutton" @click="handleShowFormat">
          <template v-slot:element>
            <i class="fa-solid fa-brush mr-2"></i>
            <span>Format</span>
          </template>
          <template v-slot:menu>
            <Transition name="fadetool">
              <SubMenu ref="formatsub" v-show=showFormat>
                <div class="p-1.5">
                  <ToolsButton @click="executeCommand($event, 'bold')" title="ctrl + b" :active="markState('bold').value" :available="commandState('bold').value">
                    <template v-slot:element>
                      <i class="fa-solid fa-bold mr-2"></i>
                      <span>Bold</span>
                    </template>
                  </ToolsButton>
                  <ToolsButton @click="executeCommand($event, 'italic')" title="ctrl + i" :active="markState('italic').value" :available="commandState('italic').value">
                    <template v-slot:element>
                      <i class="fa-solid fa-italic mr-2"></i>
                      <span>Italic</span>
                    </template>
                  </ToolsButton>
                  <ToolsButton @click="executeCommand($event, 'underline')" title="ctrl + u" :active="markState('underline').value" :available="commandState('underline').value">
                    <template v-slot:element>
                      <i class="fa-solid fa-underline mr-2"></i>
                      <span>Underline</span>
                    </template>
                  </ToolsButton>
                  <ToolsButton @click="executeCommand($event, 'strikethrough')" title="ctrl + shift + s / ctrl + shift + x" :active="markState('strikethrough').value" :available="commandState('strikethrough').value">
                    <template v-slot:element>
                      <i class="fa-solid fa-strikethrough mr-2"></i>
                      <span>Strikethrough</span>
                    </template>
                  </ToolsButton>
                  <ToolsButton @click="executeCommand($event, 'code')" title="ctrl + e" :active="markState('code').value" :available="commandState('code').value">
                    <template v-slot:element>
                      <i class="fa-solid fa-code mr-2"></i>
                      <span>Code</span>
                    </template>
                  </ToolsButton>
                </div>
              </SubMenu>
            </Transition>
          </template>
        </ToolsButton>
        <ToolsButton :chevron="true" ref="turnbutton" @click="handleShowTurn">
          <template v-slot:element>
            <i class="fa-solid fa-repeat mr-2"></i>
            <span>Turn Into</span>
          </template>
          <template v-slot:menu>
            <Transition name="fadetool">
              <SubMenu ref="turnsub" v-show=showTurn>
                <div class="p-1.5">
                  <ToolsButton @click="executeCommand($event, 'paragraph')" title="ctrl + alt + 0" :available="states['paragraph'].node || commandState('paragraph').value">
                    <template v-slot:element>
                      <i class="fa-solid fa-paragraph mr-2"></i>
                      <span>Paragraph</span>
                    </template>
                  </ToolsButton>
                  <ToolsButton @click="executeCommand($event, 'h1')" title="ctrl + alt + 1" :available="states['h1'].node || commandState('h1').value">
                    <template v-slot:element>
                      <div class="font-bold mr-2">H1</div>
                      <span>Heading 1</span>
                    </template>
                  </ToolsButton>
                  <ToolsButton @click="executeCommand($event, 'h2')" title="ctrl + alt + 2":available="states['h2'].node || commandState('h2').value">
                    <template v-slot:element>
                      <div class="font-bold mr-2">H2</div>
                      <span>Heading 2</span>
                    </template>
                  </ToolsButton>
                  <ToolsButton @click="executeCommand($event, 'h3')" title="ctrl + alt + 3":available="states['h3'].node || commandState('h3').value">
                    <template v-slot:element>
                      <div class="font-bold mr-2">H3</div>
                      <span>Heading 3</span>
                    </template>
                  </ToolsButton>
                </div>
                <div class="p-1.5">
                  <ToolsButton @click="executeCommand($event, 'ul')" title="ctrl + shift + 8" :available="commandState('ul').value">
                    <template v-slot:element>
                      <i class="fa-solid fa-list-ul mr-2"></i>
                      <span>Bullet list</span>
                    </template>
                  </ToolsButton>
                  <ToolsButton @click="executeCommand($event, 'ol')" title="ctrl + shift + 9" :available="commandState('ol').value">
                    <template v-slot:element>
                      <i class="fa-solid fa-list-ol mr-2"></i>
                      <span>Ordered list</span>
                    </template>
                  </ToolsButton>
                  <ToolsButton @click="executeCommand($event, 'check')" title="ctrl + shift + ":available="states['check'].node || commandState('check').value">
                    <template v-slot:element>
                      <i class="fa-solid fa-list-check mr-2"></i>
                      <span>To-do list</span>
                    </template>
                  </ToolsButton>
                </div>
                <div class="p-1.5">
                  <ToolsButton @click="executeCommand($event, 'code_block')" title="ctrl + shift + \":available="states['code_block'].node || commandState('code_block').value">
                    <template v-slot:element>
                      <i class="fa-solid fa-code mr-2"></i>
                      <span>Code block</span>
                    </template>
                  </ToolsButton>
                  <ToolsButton @click="executeCommand($event, 'indent')" title="tab" :available="commandState('indent').value">
                    <template v-slot:element>
                      <i class="fa-solid fa-indent mr-2"></i>
                      <span>Blockquote</span>
                    </template>
                  </ToolsButton>
                </div>
              </SubMenu>
            </Transition>
          </template>
        </ToolsButton>
        <ToolsButton :chevron="true" ref="insertbutton" @click="handleShowInsert">
          <template v-slot:element>
            <i class="fa-solid fa-plus mr-2"></i>
            <span>Insert</span>
          </template>
          <template v-slot:menu>
            <Transition name="fadetool">
              <SubMenu ref="insertsub" v-show=showInsert>
                <div class="p-1.5">
                  <ToolsButton @click="executeCommand($event, 'hr')" title="ctrl + _" :available="commandState('hr').value">
                    <template v-slot:element>
                      <i class="fa-solid fa-window-minimize mr-2"></i>
                      <span>Horizontal Rule</span>
                    </template>
                  </ToolsButton>
                  <ToolsButton @click="executeCommand($event, 'table')" title="ctrl + m" :available="commandState('table').value">
                    <template v-slot:element>
                      <i class="fa-solid fa-table mr-2"></i>
                      <span>Table</span>
                    </template>
                  </ToolsButton>
                  <ToolsButton @click="executeCommand($event, 'columns')" title="ctrl + k" :available="commandState('columns').value">
                    <template v-slot:element>
                      <i class="fa-solid fa-grip-lines-vertical mr-2"></i>
                      <span>Columns</span>
                    </template>
                  </ToolsButton>
                </div>
              </SubMenu>
            </Transition>
          </template>
        </ToolsButton>
      </div>  
      <div class="p-1.5">
        <ToolsButton :chevron="true" ref="colorbutton"  @click="handleShowColor">
          <template v-slot:element>
            <i class="fa-solid fa-paint-roller mr-2"></i>
            <span>Color</span>
          </template>
          <template v-slot:menu>
            <Transition name="fadetool">
              <SubMenu ref="colorsub" v-show=showColor>
                <div class="p-1.5">
                  <ToolsButton v-for="color, key in colors" :key="key" @click="executeCommand($event, 'setcolor_' + key)">
                    <template v-slot:element>
                      <i class="fa-solid fa-palette -ml-0.5 p-1.5 mr-2 rounded bg-opacity-30"
                      :class="'bg-' + color.class"></i><span>{{ color.name || "Error" }}</span>
                    </template>
                  </ToolsButton>
                </div>
              </SubMenu>
            </Transition>
          </template>
        </ToolsButton>
      </div>
      <div class="p-1.5">
        <ToolsButton @click="executeCommand($event, 'indent')" title="tab" :available="commandState('indent').value">
          <template v-slot:element>
            <i class="fa-solid fa-indent mr-2"></i>
            <span>Indent</span>
          </template>
        </ToolsButton>
        <ToolsButton @click="executeCommand($event, 'outdent')" title="shift + tab" :available="commandState('outdent').value">
          <template v-slot:element>
            <i class="fa-solid fa-outdent mr-2"></i>
            <span>Outdent</span>
          </template>
        </ToolsButton>
      </div>
      <div class="p-1.5">
        <ToolsButton :available="false">
          <template v-slot:element>
            <i class="fa-solid fa-trash-can mr-2"></i>
            <span>Delete</span>
          </template>
        </ToolsButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { Ref, computed, nextTick, ref } from "vue";
import { Editor, PubSub } from "@core";
import { ButtonDirection, ToolbarButton, IconButton, Veil } from "@components"
import ToolsButton from './ToolsButton.vue'
import SubMenu from './SubMenu.vue'

import { colors } from '@core'

const toggleSubmenu = async (showRef: Ref<any>, button: Ref<any>, sub: Ref<any>) => {
  if(!showRef.value) {
    hideAllExcept(showRef)
    showRef.value = true;
    await nextTick()
    let toolbar = document.getElementById('toolbar');
    if(!toolbar || !sub.value || !button.value) return

    let b = button.value.$el as HTMLElement;
    let s = sub.value.$el as HTMLElement;

    let left = toolbar.clientWidth - 2 + 4
    let top = b.offsetTop - 6

    if (toolbar.offsetTop + top + s.clientHeight > document.body.clientHeight) {
      top = b.offsetTop + b.clientHeight + 6 - s.clientHeight
    }

    if (toolbar.offsetLeft + left + s.clientWidth > document.body.clientWidth) {
      left = 0 - s.clientWidth - 2 - 4
    }
    
    sub.value.setPos(left, top)

  } else {
    showRef.value = false;
  }
}

const showColor = ref(false)
const colorbutton = ref<null | InstanceType<typeof ToolsButton>>(null);
const colorsub = ref<null | InstanceType<typeof SubMenu>>(null);
const handleShowColor = async () => {
  toggleSubmenu(showColor, colorbutton, colorsub)
}

const showFormat = ref(false)
const formatbutton = ref<null | InstanceType<typeof ToolsButton>>(null);
const formatsub = ref<null | InstanceType<typeof SubMenu>>(null);
const handleShowFormat = async () => {
  toggleSubmenu(showFormat, formatbutton, formatsub)
}

const showTurn = ref(false)
const turnbutton = ref<null | InstanceType<typeof ToolsButton>>(null);
const turnsub = ref<null | InstanceType<typeof SubMenu>>(null);
const handleShowTurn = async () => {
  toggleSubmenu(showTurn, turnbutton, turnsub)
}

const showInsert = ref(false)
const insertbutton = ref<null | InstanceType<typeof ToolsButton>>(null);
const insertsub = ref<null | InstanceType<typeof SubMenu>>(null);
const handleShowInsert = async () => {
  toggleSubmenu(showInsert, insertbutton, insertsub)
}

const hideAllExcept = (except: Ref) => {
  let arr = [showFormat, showColor, showTurn, showInsert]
  arr.forEach(toHide => {
    if (toHide != except) toHide.value = false;
  })
}

const pubSub = PubSub.getInstance();
const editor = Editor.getInstance();

const commands = editor.menu.buttons;
const states = editor.menu.states.value;

PubSub.subscribe('hide-toolbar', () => {
  showColor.value = false;
  showFormat.value = false;
  showTurn.value = false;
  showInsert.value = false;
})

const executeCommand = (e: Event, command: string) => {
  e.preventDefault();
  pubSub.emit('hide-toolbar');
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
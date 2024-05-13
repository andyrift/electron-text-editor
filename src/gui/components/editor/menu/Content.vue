<template>
  <Container ref="container" class="fixed">
    <div v-show="showTableActions" class="p-1">
      <MenuButton :chevron="true" ref="tableButton" @click="menus[0]![3]">
        <template v-slot:content>
          <i class="fa-solid fa-table mr-2"></i>
          <span>Table Actions</span>
        </template>
        <template v-slot:submenu>
          <Transition name="fadetool">
            <Container ref="tableMenu" class="absolute" v-show=menus[0]![2].value>
              <div class="p-1">
                <MenuButton @click="executeCommand($event, 't_col_before')"
                  :available="commandState('t_col_before').value">
                  <template v-slot:content>
                    <i class="fa-solid fa-arrow-left mr-2"></i>
                    <span>{{ "Add Column Before" }}</span>
                  </template>
                </MenuButton>
                <MenuButton @click="executeCommand($event, 't_col_after')"
                  :available="commandState('t_col_after').value">
                  <template v-slot:content>
                    <i class="fa-solid fa-arrow-right mr-2"></i>
                    <span>{{ "Add Column After" }}</span>
                  </template>
                </MenuButton>
                <MenuButton @click="executeCommand($event, 't_row_before')"
                  :available="commandState('t_row_before').value">
                  <template v-slot:content>
                    <i class="fa-solid fa-arrow-up mr-2"></i>
                    <span>{{ "Add Row Before" }}</span>
                  </template>
                </MenuButton>
                <MenuButton @click="executeCommand($event, 't_row_after')"
                  :available="commandState('t_row_after').value">
                  <template v-slot:content>
                    <i class="fa-solid fa-arrow-down mr-2"></i>
                    <span>{{ "Add Row After" }}</span>
                  </template>
                </MenuButton>
              </div>
              <div class="p-1">
                <MenuButton @click="executeCommand($event, 't_del_col')" :available="commandState('t_del_col').value">
                  <template v-slot:content>
                    <i class="fa-solid fa-trash-can mr-2"></i>
                    <span>{{ "Delete Column" }}</span>
                  </template>
                </MenuButton>
                <MenuButton @click="executeCommand($event, 't_del_row')" :available="commandState('t_del_row').value">
                  <template v-slot:content>
                    <i class="fa-solid fa-trash-can mr-2"></i>
                    <span>{{ "Delete Row" }}</span>
                  </template>
                </MenuButton>
              </div>
              <div class="p-1">
                <MenuButton @click="executeCommand($event, 't_merge_cell')"
                  :available="commandState('t_merge_cell').value">
                  <template v-slot:content>
                    <i class="fa-solid fa-arrow-right"></i>
                    <i class="fa-solid fa-arrow-left mr-2"></i>
                    <span>{{ "Merge Cells" }}</span>
                  </template>
                </MenuButton>
                <MenuButton @click="executeCommand($event, 't_split_cell')"
                  :available="commandState('t_split_cell').value">
                  <template v-slot:content>
                    <i class="fa-solid fa-arrow-left"></i>
                    <i class="fa-solid fa-arrow-right mr-2"></i>
                    <span>{{ "Split Cell" }}</span>
                  </template>
                </MenuButton>
              </div>
              <div class="p-1">
                <MenuButton @click="executeCommand($event, 't_head_cell')"
                  :available="commandState('t_head_cell').value">
                  <template v-slot:content>
                    <i class="fa-solid fa-heading mr-2"></i>
                    <span>{{ "Toggle Cell Header" }}</span>
                  </template>
                </MenuButton>
                <MenuButton @click="executeCommand($event, 't_head_col')" :available="commandState('t_head_col').value">
                  <template v-slot:content>
                    <i class="fa-solid fa-heading mr-2"></i>
                    <span>{{ "Toggle Column Header" }}</span>
                  </template>
                </MenuButton>
                <MenuButton @click="executeCommand($event, 't_head_row')" :available="commandState('t_head_row').value">
                  <template v-slot:content>
                    <i class="fa-solid fa-heading mr-2"></i>
                    <span>{{ "Toggle Row Header" }}</span>
                  </template>
                </MenuButton>
              </div>
              <!--<div class="p-1">
                  <MenuButton @click="executeCommand($event, 't_cell_forward')" :available="commandState('t_cell_forward').value">
                    <template v-slot:content>
                      <i class="fa-solid fa-forward mr-2"></i>
                      <span>{{ "Go to cell forward" }}</span>
                    </template>
                  </MenuButton>
                  <MenuButton @click="executeCommand($event, 't_cell_backward')" :available="commandState('t_cell_backward').value">
                    <template v-slot:content>
                      <i class="fa-solid fa-backward mr-2"></i>
                      <span>{{ "Go to cell backward" }}</span>
                    </template>
                  </MenuButton>
                </div>-->
              <div class="p-1">
                <MenuButton @click="executeCommand($event, 't_delete')" :available="commandState('t_delete').value">
                  <template v-slot:content>
                    <i class="fa-solid fa-trash-can mr-2"></i>
                    <span>{{ "Delete Table" }}</span>
                  </template>
                </MenuButton>
              </div>
            </Container>
          </Transition>
        </template>
      </MenuButton>
    </div>
    <!--<div class="p-1">
        <MenuButton :available="false">
          <template v-slot:content>
            <i class="fa-solid fa-link mr-2"></i>
            <span>Add Link</span>
          </template>
        </MenuButton>
      </div>-->
    <div class="p-1">
      <MenuButton :chevron="true" ref="formatButton" @click="menus[1]![3]">
        <template v-slot:content>
          <i class="fa-solid fa-brush mr-2"></i>
          <span>Format</span>
        </template>
        <template v-slot:submenu>
          <Transition name="fadetool">
            <Container ref="formatMenu" class="absolute" v-show=menus[1]![2].value>
              <div class="p-1">
                <MenuButton @click="executeCommand($event, 'bold')" title="ctrl + b" :active="markState('bold').value"
                  :available="commandState('bold').value">
                  <template v-slot:content>
                    <i class="fa-solid fa-bold mr-2"></i>
                    <span>Bold</span>
                  </template>
                </MenuButton>
                <MenuButton @click="executeCommand($event, 'italic')" title="ctrl + i"
                  :active="markState('italic').value" :available="commandState('italic').value">
                  <template v-slot:content>
                    <i class="fa-solid fa-italic mr-2"></i>
                    <span>Italic</span>
                  </template>
                </MenuButton>
                <MenuButton @click="executeCommand($event, 'underline')" title="ctrl + u"
                  :active="markState('underline').value" :available="commandState('underline').value">
                  <template v-slot:content>
                    <i class="fa-solid fa-underline mr-2"></i>
                    <span>Underline</span>
                  </template>
                </MenuButton>
                <MenuButton @click="executeCommand($event, 'strikethrough')" title="ctrl + shift + s / ctrl + shift + x"
                  :active="markState('strikethrough').value" :available="commandState('strikethrough').value">
                  <template v-slot:content>
                    <i class="fa-solid fa-strikethrough mr-2"></i>
                    <span>Strikethrough</span>
                  </template>
                </MenuButton>
                <MenuButton @click="executeCommand($event, 'code')" title="ctrl + e" :active="markState('code').value"
                  :available="commandState('code').value">
                  <template v-slot:content>
                    <i class="fa-solid fa-code mr-2"></i>
                    <span>Code</span>
                  </template>
                </MenuButton>
              </div>
            </Container>
          </Transition>
        </template>
      </MenuButton>
      <MenuButton :chevron="true" ref="turnButton" @click="menus[2]![3]">
        <template v-slot:content>
          <i class="fa-solid fa-repeat mr-2"></i>
          <span>Turn Into</span>
        </template>
        <template v-slot:submenu>
          <Transition name="fadetool">
            <Container ref="turnMenu" class="absolute" v-show=menus[2]![2].value>
              <div class="p-1">
                <MenuButton @click="executeCommand($event, 'paragraph')" title="ctrl + alt + 0"
                  :available="states['paragraph']?.node || commandState('paragraph').value">
                  <template v-slot:content>
                    <i class="fa-solid fa-paragraph mr-2"></i>
                    <span>Paragraph</span>
                  </template>
                </MenuButton>
                <MenuButton @click="executeCommand($event, 'h1')" title="ctrl + alt + 1"
                  :available="states['h1']?.node || commandState('h1').value">
                  <template v-slot:content>
                    <div class="font-bold mr-2">H1</div>
                    <span>Heading 1</span>
                  </template>
                </MenuButton>
                <MenuButton @click="executeCommand($event, 'h2')" title="ctrl + alt + 2"
                  :available="states['h2']?.node || commandState('h2').value">
                  <template v-slot:content>
                    <div class="font-bold mr-2">H2</div>
                    <span>Heading 2</span>
                  </template>
                </MenuButton>
                <MenuButton @click="executeCommand($event, 'h3')" title="ctrl + alt + 3"
                  :available="states['h3']?.node || commandState('h3').value">
                  <template v-slot:content>
                    <div class="font-bold mr-2">H3</div>
                    <span>Heading 3</span>
                  </template>
                </MenuButton>
              </div>
              <div class="p-1">
                <MenuButton @click="executeCommand($event, 'ul')" title="ctrl + shift + 8"
                  :available="commandState('ul').value">
                  <template v-slot:content>
                    <i class="fa-solid fa-list-ul mr-2"></i>
                    <span>Bullet list</span>
                  </template>
                </MenuButton>
                <MenuButton @click="executeCommand($event, 'ol')" title="ctrl + shift + 9"
                  :available="commandState('ol').value">
                  <template v-slot:content>
                    <i class="fa-solid fa-list-ol mr-2"></i>
                    <span>Ordered list</span>
                  </template>
                </MenuButton>
                <MenuButton @click="executeCommand($event, 'check')" title="ctrl + shift + "
                  :available="states['check']?.node || commandState('check').value">
                  <template v-slot:content>
                    <i class="fa-solid fa-list-check mr-2"></i>
                    <span>To-do list</span>
                  </template>
                </MenuButton>
              </div>
              <div class="p-1">
                <MenuButton @click="executeCommand($event, 'code_block')" title="ctrl + shift + \"
                  :available="states['code_block']?.node || commandState('code_block').value">
                  <template v-slot:content>
                    <i class="fa-solid fa-code mr-2"></i>
                    <span>Code block</span>
                  </template>
                </MenuButton>
                <MenuButton @click="executeCommand($event, 'indent')" title="tab"
                  :available="commandState('indent').value">
                  <template v-slot:content>
                    <i class="fa-solid fa-indent mr-2"></i>
                    <span>Blockquote</span>
                  </template>
                </MenuButton>
              </div>
            </Container>
          </Transition>
        </template>
      </MenuButton>
      <MenuButton :chevron="true" ref="insertButton" @click="menus[3]![3]">
        <template v-slot:content>
          <i class="fa-solid fa-plus mr-2"></i>
          <span>Insert</span>
        </template>
        <template v-slot:submenu>
          <Transition name="fadetool">
            <Container ref="insertMenu" class="absolute" v-show=menus[3]![2].value>
              <div class="p-1">
                <MenuButton @click="executeCommand($event, 'hr')" title="ctrl + _"
                  :available="commandState('hr').value">
                  <template v-slot:content>
                    <i class="fa-solid fa-window-minimize mr-2"></i>
                    <span>Horizontal Rule</span>
                  </template>
                </MenuButton>
                <MenuButton @click="executeCommand($event, 'table')" title="ctrl + m"
                  :available="commandState('table').value">
                  <template v-slot:content>
                    <i class="fa-solid fa-table mr-2"></i>
                    <span>Table</span>
                  </template>
                </MenuButton>
                <MenuButton @click="executeCommand($event, 'columns')" title="ctrl + k"
                  :available="commandState('columns').value">
                  <template v-slot:content>
                    <i class="fa-solid fa-grip-lines-vertical mr-2"></i>
                    <span>Columns</span>
                  </template>
                </MenuButton>
                <MenuButton @click="executeCommand($event, 'pagelink', null)"
                  :available="commandState('pagelink').value">
                  <template v-slot:content>
                    <i class="fa-solid fa-file-lines mr-2"></i>
                    <span>Page Link</span>
                  </template>
                </MenuButton>
              </div>
            </Container>
          </Transition>
        </template>
      </MenuButton>
    </div>
    <div class="p-1">
      <MenuButton :chevron="true" ref="colorButton" @click="menus[4]![3]">
        <template v-slot:content>
          <i class="fa-solid fa-paint-roller mr-2"></i>
          <span>Color</span>
        </template>
        <template v-slot:submenu>
          <Transition name="fadetool">
            <Container ref="colorMenu" class="absolute" v-show=menus[4]![2].value>
              <div class="p-1">
                <MenuButton v-for="color, key in colors" :key="key" @click="executeCommand($event, 'setcolor_' + key)">
                  <template v-slot:content>
                    <i class="text-black text-opacity-0 fa-solid fa-palette -ml-0.5 p-1.5 mr-2 rounded bg-opacity-30"
                      :class="'bg-' + color.class"></i><span>{{ color.name || "Error" }}</span>
                  </template>
                </MenuButton>
              </div>
            </Container>
          </Transition>
        </template>
      </MenuButton>
    </div>
    <div class="p-1">
      <MenuButton @click="executeCommand($event, 'indent')" title="tab" :available="commandState('indent').value">
        <template v-slot:content>
          <i class="fa-solid fa-indent mr-2"></i>
          <span>Indent</span>
        </template>
      </MenuButton>
      <MenuButton @click="executeCommand($event, 'outdent')" title="shift + tab"
        :available="commandState('outdent').value">
        <template v-slot:content>
          <i class="fa-solid fa-outdent mr-2"></i>
          <span>Outdent</span>
        </template>
      </MenuButton>
    </div>
    <div class="p-1">
      <MenuButton @click="executeCommand($event, 'delete')" :available="commandState('delete').value">
        <template v-slot:content>
          <i class="fa-solid fa-trash-can mr-2"></i>
          <span>Delete</span>
        </template>
      </MenuButton>
    </div>
  </Container>
</template>

<script setup lang="ts">
import Container from "./Container.vue"
import MenuButton from "./MenuButton.vue";

import { computed, nextTick, Ref, ref } from "vue"
import { PubSub } from "@src/pubSub";
import { MenuState, colors } from "@src/editor";
const pubSub = PubSub.getInstance()

const container = ref<InstanceType<typeof Container> | null>(null)

const props = defineProps<{
  menuState: MenuState
}>()

const menuState = props.menuState;

const commands = menuState.buttons;
const states = menuState.states;

const tableActions = [
  "t_col_before",
  "t_col_after",
  "t_row_before",
  "t_row_after",
  "t_del_col",
  "t_del_row",
  "t_merge_cell",
  "t_split_cell",
  "t_head_cell",
  "t_head_col",
  "t_head_row",
  "t_cell_forward",
  "t_cell_backward",
  "t_delete",
]

const showTableActions = computed(() => {
  let show = false
  tableActions.forEach(action => {
    show ||= !!states.value[action]?.applicable
  })
  return show
})

const showTable = ref(false)

const tableMenu = ref<null | InstanceType<typeof Container>>(null)
const formatMenu = ref<null | InstanceType<typeof Container>>(null)
const turnMenu = ref<null | InstanceType<typeof Container>>(null)
const insertMenu = ref<null | InstanceType<typeof Container>>(null)
const colorMenu = ref<null | InstanceType<typeof Container>>(null)

const tableButton = ref<null | InstanceType<typeof MenuButton>>(null)
const formatButton = ref<null | InstanceType<typeof MenuButton>>(null)
const turnButton = ref<null | InstanceType<typeof MenuButton>>(null)
const insertButton = ref<null | InstanceType<typeof MenuButton>>(null)
const colorButton = ref<null | InstanceType<typeof MenuButton>>(null)

const menus: ReadonlyArray<[
  Ref<null | InstanceType<typeof Container>>, 
  Ref<null | InstanceType<typeof MenuButton>>,
  Ref<boolean>,
  () => void,
]> = [
  [tableMenu, tableButton, ref(false), () => {toggleContainer(0)}],
  [formatMenu, formatButton, ref(false), () => {toggleContainer(1)}],
  [turnMenu, turnButton, ref(false), () => {toggleContainer(2)}],
  [insertMenu, insertButton, ref(false), () => {toggleContainer(3)}],
  [colorMenu, colorButton, ref(false), () => {toggleContainer(4)}],
]

const toggleContainer = async (index: number) => {
  const menu = menus[index]
  if (!menu) return

  const subContainer = menu[0].value
  if (!subContainer) return

  const button = menu[1].value
  if (!button) return
  
  if (!container.value) return
  const containercontent: HTMLElement = container.value.$el

  if (menu[2].value) {
    menu[2].value = false;
  } else {
    hideAllExcept(subContainer)
    menu[2].value = true;
    await nextTick()

    let b = button.$el as HTMLElement;
    let s = subContainer.$el as HTMLElement;

    let left = containercontent.clientWidth - 2 + 4
    let top = b.offsetTop - 6

    if (containercontent.offsetTop + top + s.clientHeight > document.body.clientHeight) {
      top = b.offsetTop + b.clientHeight + 6 - s.clientHeight
    }

    if (containercontent.offsetLeft + left + s.clientWidth > document.body.clientWidth) {
      left = 0 - s.clientWidth - 2 - 4
    }

    subContainer.setPos(left, top)

  }
}

const hideAllExcept = (except: InstanceType<typeof Container>) => {
  menus.forEach(item => {
    if (item[0].value != except) item[2].value = false
  })
}

PubSub.subscribe('toggle-editor-context-menu', (value: boolean) => {
  if (!value) {
    menus.forEach(item => {
      item[2].value = false
    })
  }
})

const executeCommand = (e: Event, name: string, ...args: any[]) => {
  e.preventDefault()
  pubSub.emit('toggle-editor-context-menu', false)
  const command = commands.value[name]
  if (command) command(...args)
}

const commandState = (name: string) => {
  return computed(() => {
    return (states.value[name]?.applicable)
  })
}

const markState = (name: string) => {
  return computed(() => {
    return (states.value[name]?.mark)
  })
}

const setPos = (l: number, t: number) => {
  if (container.value) container.value.setPos(l, t)
}

defineExpose({
  setPos
})
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
</style>
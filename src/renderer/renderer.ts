import initGUI from "../gui/init"

import { PubSub } from "@src/pubSub"
const pubSub = PubSub.getInstance()
pubSub.subscribe("toggle-dev-tools", () => {
  window.send("toggle-dev-tools")
})
pubSub.subscribe("reload-window", () => {
  window.send("reload-window")
})
pubSub.subscribe("force-reload-window", () => {
  window.send("force-reload-window")
})

initGUI()

import { WorkspaceManager } from "@src/workspace-manager/workspaceManager"
import { WorkspaceStructure } from "@src/workspace-manager/workspaceStructure"

const workspaceManager = new WorkspaceManager()
const workspaceStructure = new WorkspaceStructure()

const getters = {
  getWorkspacePages: () => { return workspaceStructure.pages },
  getWorkspaceFolders: () => { return workspaceStructure.folders },
  getWorkspaceTrashPages: () => { return workspaceStructure.pages_trash },
}

declare global {
  interface Window {
    getters: typeof getters
  }
}

window.getters = getters
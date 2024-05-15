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

import { WorkspaceManager } from "@src/workspace-manager/workspaceManager"

const workspaceManager = WorkspaceManager.getInstance()

const getters = {
  getWorkspacePages: () => { return workspaceManager.getPageMap() },
  getWorkspaceFolders: () => { return workspaceManager.getFolderMap() },
}

declare global {
  interface Window {
    getters: typeof getters
  }
}

window.getters = getters

initGUI()
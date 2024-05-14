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

import { IWorkspaceStructure, WorkspaceStructure } from "@src/workspace-manager/workspaceStructure"
import { IWorkspaceManager, WorkspaceManager } from "@src/workspace-manager/workspaceManager"
import { IStateManager, StateManager } from "@src/state-manager/stateManager"

const workspaceStructure: IWorkspaceStructure = new WorkspaceStructure()

const workspaceManager: IWorkspaceManager = new WorkspaceManager(workspaceStructure)

const stateManager: IStateManager = new StateManager()

const getters = {
  getWorkspacePages: () => { return workspaceManager.getPageMap() },
  getWorkspaceFolders: () => { return workspaceManager.getFolderMap() },
  // getWorkspaceTrashPages: () => { return workspaceStructure.pages_trash },
}

declare global {
  interface Window {
    getters: typeof getters
  }
}

window.getters = getters

initGUI()
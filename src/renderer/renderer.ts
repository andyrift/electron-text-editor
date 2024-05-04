import initGUI from "../gui/init"

import { PubSub } from "@src/pubSub"
const pubSub = PubSub.getInstance()
pubSub.subscribe("toggle-dev-tools", () => {
  window.send("toggle-dev-tools")
})

initGUI()

import { WorkspaceManager } from "@src/workspace-manager/workspaceManager"
import { WorkspaceStructure } from "@src/workspace-manager/workspaceStructure"

const workspaceManager = new WorkspaceManager()
const workspaceStructure = new WorkspaceStructure()
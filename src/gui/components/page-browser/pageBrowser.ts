export type Page = {
  type: "page"
  id: number
  title: string | null
}

export type Folder = {
  type: "folder"
  id: number
  open: boolean
  content: Array<Page | Folder>
  name: string | null
}

export type BrowserHierarchy = Array<Page | Folder>

export type FolderOpen = { [key: number]: boolean }

import type { StructureHierarchy } from "@src/workspace-manager/workspaceStructure"

export function constructContent(
  structure: StructureHierarchy,
  folders: ReturnType<typeof window.getters.getWorkspaceFolders>,
  pages: ReturnType<typeof window.getters.getWorkspacePages>,
  folderOpen: FolderOpen) {
  const str: BrowserHierarchy = []
  structure.forEach(item => {
    if ("content" in item) {
      const folder = folders.get(item.id)
      if (!folder) throw "Workspage structure not synchronized. Folder exists in structure but not in map"
      var open = false
      open = folderOpen[item.id] || false
      str.push({
        type: "folder",
        open,
        id: item.id,
        name: folder.name,
        content: constructContent(item.content, folders, pages, folderOpen)
      })
    } else {
      const page = pages.get(item.id)
      if (!page) throw "Workspage structure not synchronized. Page exists in structure but not in map"
      str.push({
        type: "page",
        id: page.id,
        title: page.title
      })
    }
  })
  return str
}

export function constructOpen(structure: BrowserHierarchy) {
  const folderOpen: FolderOpen = {}
  structure.forEach(item => {
    if ("content" in item) {
      folderOpen[item.id] = item.open
      Object.assign(folderOpen, constructOpen(item.content))
    }
  })
  return folderOpen
}

export function updateOpenInStructure(structure: BrowserHierarchy, folderOpen: FolderOpen) {
  structure.forEach(item => {
    if ("content" in item) {
      item.open = folderOpen[item.id] || false
      updateOpenInStructure(item.content, folderOpen)
    }
  })
}
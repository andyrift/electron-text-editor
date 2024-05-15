export type Page = {
  type: "page"
  key: string
  id: number
  title: string | null
}

export type Folder = {
  type: "folder"
  key: string
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
        key: "f" + item.id,
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
        key: "p" + item.id,
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

export function updateOpenInStructure(structure: BrowserHierarchy, id: number, open: boolean) {
  structure.forEach(item => {
    if ("content" in item) {
      if (item.id == id) item.open = open
      else updateOpenInStructure(item.content, id, open)
    }
  })
}

export function updateOpensInStructure(structure: BrowserHierarchy, open: FolderOpen) {
  structure.forEach(item => {
    if ("content" in item) {
      const value = open[item.id]
      if (value !== undefined)
        item.open = value
      updateOpensInStructure(item.content, open)
    }
  })
}

export function updateNameInStructure(structure: BrowserHierarchy, id: number, name: string | null) {
  structure.forEach(item => {
    if ("content" in item) {
      if (item.id == id) {
        console.log(id, name)
        item.name = name
      }
      else updateNameInStructure(item.content, id, name)
    }
  })
}
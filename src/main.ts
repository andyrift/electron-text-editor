import { app } from 'electron'

import squirrel from 'electron-squirrel-startup'
if (squirrel) app.quit()

import { BrowserWindow, Menu, MenuItem, type MenuItemConstructorOptions } from 'electron'

import path from 'path'

const MENU = false
const DARWIN_QUIT_ON_ALL_WINDOWS_CLOSED = true

if (!MENU) Menu.setApplicationMenu(null)

const mainMenuTemplate: Array<MenuItemConstructorOptions | MenuItem> = []

if (MENU) {
  mainMenuTemplate.push({
    label: 'File',
    submenu: [
      {
        label: 'Do something',
        click() {
          console.log("did something")
        }
      },
      {
        label: 'Quit',
        accelerator: process.platform ==
          'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click() {
          app.quit()
        }
      }
    ]
  })
  if (process.env['NODE_ENV'] !== 'production') {
    mainMenuTemplate.push({
      label: 'Dev Tools',
      submenu: [
        {
          label: 'Toggle DevTools',
          accelerator: process.platform ==
            'darwin' ? 'Command+I' : 'Ctrl+I',
          click(item, focusedWindow) {
            if (focusedWindow) focusedWindow.webContents.toggleDevTools()
          }
        },
        {
          role: 'reload'
        }
      ]
    })
  }
}

if (process.platform == 'darwin') {
  mainMenuTemplate.unshift({})
}

async function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, './preload.js'),
    },
  });

  mainWindow.maximize()

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    await mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`))
  }

  mainWindow.on('closed', () => {
    if (process.platform !== 'darwin' || DARWIN_QUIT_ON_ALL_WINDOWS_CLOSED)
      app.quit()
  })
  mainWindow.webContents.setZoomFactor(1)
  mainWindow.webContents.openDevTools()
}

function setMenu() {
  if (MENU)
  Menu.setApplicationMenu(Menu.buildFromTemplate(mainMenuTemplate));
}

function onMacReopen() {
  if (!DARWIN_QUIT_ON_ALL_WINDOWS_CLOSED) {
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  }
}

function onAllWindowsClosed() {
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin' || DARWIN_QUIT_ON_ALL_WINDOWS_CLOSED) 
    app.quit()
  })
}

import { initDB } from './database/db'
import { initIPCMain } from './ipc/ipc'

async function init() {
  setMenu()
  onMacReopen()
  onAllWindowsClosed()

  const model = await initDB('database/', 'database.db')

  if (!model) {
    app.quit()
    return
  }

  await initIPCMain(model)

  await createWindow()
}

app.whenReady().then(init)
import { app } from 'electron';

import squirrel from 'electron-squirrel-startup';
if (squirrel) app.quit();

import { BrowserWindow, Menu, MenuItem, MenuItemConstructorOptions } from 'electron';

import path from 'path';
import { api } from './api';

let mainWindow: BrowserWindow;

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    await mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  mainWindow.maximize();

  mainWindow.on('closed', () => {
    /*if (process.platform !== 'darwin')*/ app.quit()
  });
};

const mainMenuTemplate: Array<MenuItemConstructorOptions | MenuItem> = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Do something',
        click() {
          console.log("did something")
        }
      },
      {
        label: 'Clear Items',
        click() {
          mainWindow.webContents.send('item:clear');
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
  }
]

// add dev tools to main menu

if (process.env.NODE_ENV !== 'production') {
  mainMenuTemplate. push({
    label: 'Dev Tools',
    submenu: [
      {
        label: 'Toggle DevTools',
        accelerator: process.platform ==
          'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.toggleDevTools();
        }
      },
      {
        role: 'reload'
      }
    ]
  })
}

if (process.platform == 'darwin') {
  mainMenuTemplate.unshift({});
}

const setMenu = () => {
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(mainMenu);
};

const onMacReopen = () => {
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  })
};

const onAllWindowsClosed = () => {
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  })
};

const init = async () => {
  setMenu();
  onMacReopen();
  onAllWindowsClosed();

  api();

  await createWindow();

  //mainWindow.webContents.openDevTools();
}

app.whenReady().then(init);
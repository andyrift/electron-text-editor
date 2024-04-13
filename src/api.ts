import { ipcMain } from "electron";
import md5 from 'md5';

//import { dbApi } from './dbApi';
import { initDB } from "./db";
import dbApi from './dbApi'

export const api = () => {
  ipcMain.on('log-message', (_event, message) => {
    console.log(message);
  });
  ipcMain.handle('hash-message', async (_event, message) => {
    return (md5(message));
  });
  let pairs = dbApi(initDB());
  for (let key in pairs) {
    ipcMain.handle(key, pairs[key]);
  }
}
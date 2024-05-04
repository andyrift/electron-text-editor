import { contextBridge } from 'electron'
import { typedIpcRenderer } from '@src/ipc/ipc';

declare global {
  interface Window {
    invoke: typeof typedIpcRenderer.invoke
    send: typeof typedIpcRenderer.send
    settings: any;
  }
}

contextBridge.exposeInMainWorld('invoke', typedIpcRenderer.invoke)
contextBridge.exposeInMainWorld('send', typedIpcRenderer.send)
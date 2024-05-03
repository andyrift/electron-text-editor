import { contextBridge } from 'electron'
import { typedIpcRenderer } from '@src/ipc/ipc';

declare global {
  interface Window {
    invoke: typeof typedIpcRenderer.invoke
    settings: any;
  }
}

contextBridge.exposeInMainWorld('invoke', typedIpcRenderer.invoke)
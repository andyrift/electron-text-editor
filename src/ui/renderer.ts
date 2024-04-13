import "./assets/tailwind.css";
import "prosemirror-view/style/prosemirror.css";
import "prosemirror-gapcursor/style/gapcursor.css";
import "prosemirror-tables/style/tables.css";
import "./style.css";

type Response = {
  status: boolean;
  res?: any;
  err?: string;
}

type Api = {
  logMessage: (message: any) => void,
  hashMessage: (message: any) => string,
  dbquery_run: (query: string, arg?: any) => { result: any, status: boolean },
  dbquery_get: (query: string, arg?: any) => { result: any, status: boolean },
  dbquery_all: (query: string, arg?: any) => { result: any, status: boolean },
  getAllPagesInfo: () => Promise<Response>,
  createPage: (data: any) => Promise<Response>,
  deletePage: (id: number) => Promise<Response>,
  getPage: (id: number) => Promise<Response>,
  getPageData: (id: number) => Promise<Response>,
  savePage: (page: any) => Promise<Response>,
}

declare global {
  interface Window {
    api: Api;
    settings: any;
  }
}

import { createApp } from 'vue'
import App from "./App.vue";
import { Core } from './core';


window.api.logMessage("Renderer init start");
Core.getInstance();
const app = createApp(App);
app.mount("#app");


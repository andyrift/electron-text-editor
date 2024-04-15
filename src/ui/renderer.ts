import "./assets/tailwind.css";
import "prosemirror-view/style/prosemirror.css";
import "prosemirror-gapcursor/style/gapcursor.css";
import "prosemirror-tables/style/tables.css";
import "./style.css";

import { createApp } from 'vue'
import App from "./App.vue";
import { Core } from './core';


window.api.logMessage("Renderer init start");
Core.getInstance();
const app = createApp(App);
app.mount("#app");


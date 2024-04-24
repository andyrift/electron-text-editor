import "./assets/tailwind.css";

import "./assets/fontawesome/css/fontawesome.css"
import "./assets/fontawesome/css/regular.css"
import "./assets/fontawesome/css/solid.css"

import "prosemirror-view/style/prosemirror.css";
import "prosemirror-gapcursor/style/gapcursor.css";
import "prosemirror-tables/style/tables.css";

import "./style.css";

import { createApp } from 'vue'
import App from "./App.vue";

const init = () => {
  const app = createApp(App);
  app.mount("#app");
}

export default init;
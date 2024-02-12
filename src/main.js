import "./assets/main.css";
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { i18n } from "./i18n";
import profileDiv from "./components/profileDiv.vue";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(i18n);
app.component("profilePic", profileDiv);
app.mount("#app");

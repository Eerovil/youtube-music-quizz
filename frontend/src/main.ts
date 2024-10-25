import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import * as Sentry from "@sentry/vue";


const app = createApp(App)


Sentry.init({
  app,
  dsn: "https://cf4edc60a664b3f03a3b9f2e6e88d83d@o4508184908791808.ingest.de.sentry.io/4508184911413328",
  integrations: [],
});

app.mount("#app");

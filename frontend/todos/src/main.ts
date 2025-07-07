import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import apiClient from './configs/apiClient'
import App from './App.vue'
import router from './routes'
import vuetify from './plugins/vuetify'
import VueTablerIcons from 'vue-tabler-icons'
import { PerfectScrollbarPlugin } from 'vue3-perfect-scrollbar'
import 'vuetify/styles'

const app = createApp(App)

app.config.globalProperties.$apiClient = apiClient

app.use(createPinia())
app.use(router)
app.use(vuetify)
app.use(VueTablerIcons)
app.use(PerfectScrollbarPlugin)
app.mount('#app')

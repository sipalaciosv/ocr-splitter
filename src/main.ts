// src/main.ts
import './styles/tailwind.css'
import './styles/variables.css'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import 'primeicons/primeicons.css'
import ToastService from 'primevue/toastservice'
import App from './App.vue'
import router from './router'
import { useUiStore } from './stores/ui'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 🔹 Conectamos Aura al selector `.dark`
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      // PrimeVue se pone en modo oscuro cuando encuentre .dark
      darkModeSelector: '.dark',
    },
  },
})

app.use(ToastService)

const ui = useUiStore()
ui.initTheme()

app.mount('#app')

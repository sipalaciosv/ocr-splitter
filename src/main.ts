import './styles/tailwind.css'
import './styles/variables.css'
import "./assets/main.css"

import { createApp } from 'vue'
import { createPinia } from 'pinia'

// ⬇️ Agrega estas 3 líneas
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

// ⬇️ Y registra PrimeVue con un tema (Aura de ejemplo)
app.use(PrimeVue, { theme: { preset: Aura } })
app.use(ToastService)  
const ui = useUiStore()

ui.initTheme()
app.mount('#app')

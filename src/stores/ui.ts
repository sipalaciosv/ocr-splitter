import { defineStore } from 'pinia'

const STORAGE_KEY = 'ui:dark'

export const useUiStore = defineStore('ui', {
  state: () => ({
    dark: false,
  }),
  actions: {
    initTheme() {
      // 1) lee del storage o del SO la 1ª vez
      const saved = localStorage.getItem(STORAGE_KEY)
      this.dark = saved !== null
        ? saved === '1'
        : window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false

      this.applyTheme()
    },
    applyTheme() {
      const root = document.documentElement
      // Tailwind
      root.classList.toggle('dark', this.dark)
      // Variables PrimeVue/Aura relevantes
      root.style.setProperty('--p-card-background', this.dark ? '#1a1c23' : '#ffffff')
      root.style.setProperty('--p-text-color', this.dark ? '#e5e7eb' : '#0f172a')
      root.style.setProperty('--p-content-background', this.dark ? '#0b0f1a' : '#f8fafc')
      root.style.setProperty('--p-content-border-color', this.dark ? '#2a2d35' : '#e5e7eb')
      // sombras opcionales coherentes
      root.style.setProperty('--shadow-card', this.dark ? '0 10px 30px rgba(0,0,0,0.35)' : '0 10px 30px rgba(2,6,23,0.06)')
      root.style.setProperty('--shadow-card-hover', this.dark ? '0 14px 40px rgba(0,0,0,0.45)' : '0 14px 40px rgba(2,6,23,0.10)')
    },
    toggleDark() {
      this.dark = !this.dark
      localStorage.setItem(STORAGE_KEY, this.dark ? '1' : '0')
      this.applyTheme()
    },
  },
})

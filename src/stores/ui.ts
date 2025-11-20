
import { defineStore } from 'pinia'

const STORAGE_KEY = 'ui:dark'

export const useUiStore = defineStore('ui', {
  state: () => ({
    dark: false,
  }),
  actions: {
    initTheme() {

      const saved = localStorage.getItem(STORAGE_KEY)
      this.dark =
        saved !== null
          ? saved === '1'
          : window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false

      this.applyTheme()
    },
    applyTheme() {
      const root = document.documentElement

  
      root.classList.toggle('dark', this.dark)


      root.style.colorScheme = this.dark ? 'dark' : 'light'
    },
    toggleDark() {
      this.dark = !this.dark
      localStorage.setItem(STORAGE_KEY, this.dark ? '1' : '0')
      this.applyTheme()
    },
  },
})

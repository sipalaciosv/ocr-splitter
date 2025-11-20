<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
import Toast from 'primevue/toast'

const spacerH = ref('24px')
const spacerF = ref('24px')

let roH: ResizeObserver | null = null
let roF: ResizeObserver | null = null

function measureHeader() {
  const el = document.querySelector<HTMLElement>('header[data-app-navbar]')
  if (!el) return
  const h = el.getBoundingClientRect().height
  spacerH.value = `calc(${h}px + 16px)`
}

function measureFooter() {
  const el = document.querySelector<HTMLElement>('footer[data-app-footer]')
  if (!el) return
  const h = el.getBoundingClientRect().height
  spacerF.value = `calc(${h}px + 16px)`
}

function handleResize() {
  measureHeader()
  measureFooter()
}

onMounted(() => {
  measureHeader()
  measureFooter()

  const headEl = document.querySelector<HTMLElement>('header[data-app-navbar]')
  const footEl = document.querySelector<HTMLElement>('footer[data-app-footer]')

  if (headEl && 'ResizeObserver' in window) {
    roH = new ResizeObserver(measureHeader)
    roH.observe(headEl)
  }
  if (footEl && 'ResizeObserver' in window) {
    roF = new ResizeObserver(measureFooter)
    roF.observe(footEl)
  }
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  roH?.disconnect()
  roF?.disconnect()
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-[var(--surface-1)] text-[var(--text-0)]">
    <AppNavbar />
    <Toast position="top-right" />

    <div :style="{ height: spacerH }" class="shrink-0 pointer-events-none"></div>

    <main class="flex-1 w-full">
      <div class="max-w-6xl mx-auto px-3 sm:px-4">
        <slot />
      </div>
    </main>

    <div :style="{ height: spacerF }" class="shrink-0 pointer-events-none"></div>

    <AppFooter />
  </div>
</template>

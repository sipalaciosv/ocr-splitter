<script setup lang="ts">
import Card from 'primevue/card'
import Divider from 'primevue/divider'

defineProps<{
  title?: string
  subtitle?: string
  dense?: boolean
}>()
</script>

<template>
   <div
    class="w-full overflow-hidden
    rounded-[var(--radius-2xl)]
    transition-all duration-200 hover:ring-1
    bg-white dark:bg-[#1a1c23]
    text-[#0f172a] dark:text-[#e5e7eb]
    border border-[#e5e7eb] dark:border-[#2a2d35]
    shadow-[var(--shadow-card)]
    hover:shadow-[var(--shadow-card-hover)]"
  >
    <Card
      :pt="{
        root: { class: 'bg-transparent border-0 shadow-none w-full' },
        body: { class: 'p-0 w-full' }
      }"
    >
      <!-- Header -->
      <template #title>
        <!-- Si el padre define #header, lo usamos -->
        <div v-if="$slots.header">
          <slot name="header" />
        </div>

        <!-- Si NO hay #header, usamos título/subtítulo clásicos -->
        <div
          v-else
          :class="['flex items-start justify-between gap-3', dense ? 'p-3' : 'p-4 sm:p-5']"
        >
          <div>
            <h2 class="text-xl font-semibold leading-tight tracking-tight">
              {{ title }}
            </h2>
            <p v-if="subtitle" class="mt-1 text-sm text-[var(--text-muted)]">
              {{ subtitle }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <slot name="actions" />
          </div>
        </div>
      </template>

      <template #subtitle>
        <Divider class="!my-0 !border-t !border-[var(--border)]" />
      </template>

      <template #content>
        <div :class="[dense ? 'p-3' : 'p-4 sm:p-5']">
          <slot />
        </div>
      </template>

      <template #footer>
        <div :class="['border-t border-[var(--border)]', dense ? 'p-3' : 'p-4 sm:p-5']">
          <slot name="footer" />
        </div>
      </template>
    </Card>
  </div>
</template>

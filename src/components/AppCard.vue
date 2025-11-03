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
    <!-- Wrapper que controla el look (fondo, borde, sombras) -->
    <div class=" rounded-[var(--radius-2xl)]
    transition-all duration-200 hover:ring-1
    bg-white dark:bg-[#1a1c23]
    text-[#0f172a] dark:text-[#e5e7eb]
    border border-[#e5e7eb] dark:border-[#2a2d35]
    shadow-[0_10px_30px_rgba(2,6,23,0.06)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.35)]
    hover:shadow-[0_14px_40px_rgba(2,6,23,0.10)] dark:hover:shadow-[0_14px_40px_rgba(0,0,0,0.45)]">
        <!-- Card de PrimeVue SIN fondo/borde (transparente) -->
        <Card :pt="{
            root: { class: 'bg-transparent border-0 shadow-none' },
            body: { class: 'p-0' }
        }">
            <!-- Header -->
            <template #title>
                <div :class="['flex items-start justify-between gap-3', dense ? 'p-3' : 'p-4 sm:p-5']">
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

            <!-- Divider -->
            <template #subtitle>
                <Divider class="!my-0 !border-t !border-[var(--border)]" />
            </template>

            <!-- Contenido -->
            <template #content>
                <div :class="[dense ? 'p-3' : 'p-4 sm:p-5']">
                    <slot />
                </div>
            </template>

            <!-- Footer -->
            <template #footer>
                <div :class="['border-t border-[var(--border)]', dense ? 'p-3' : 'p-4 sm:p-5']">
                    <slot name="footer" />
                </div>
            </template>
        </Card>
    </div>
</template>

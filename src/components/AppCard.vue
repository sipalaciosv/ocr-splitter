<script setup lang="ts">
import Card from 'primevue/card'
import Divider from 'primevue/divider'

defineProps<{
    title?: string
    subtitle?: string
    dense?: boolean   // reduce paddings si true
}>()
</script>

<template>
    <Card :class="[
        // base visual
        'border border-[var(--border)] rounded-[var(--radius-2xl)] bg-[var(--surface-0)] text-[var(--text-0)]',
        // sombras y transición
        'shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-200',
        // sutil ring al hover/focus dentro
        'hover:ring-1 ring-[var(--border)]',
        dense ? 'p-0' : ''
    ]">
        <!-- Header -->
        <template #title>
            <div class="flex items-start justify-between gap-3 p-3 sm:p-4">
                <div>
                    <h2 class="text-xl font-semibold leading-tight tracking-tight">
                        {{ title }}
                    </h2>
                    <p v-if="subtitle" class="mt-1 text-sm text-[var(--text-muted)]">
                        {{ subtitle }}
                    </p>
                </div>

                <!-- acciones (iconos/botones) -->
                <div class="flex items-center gap-2">
                    <slot name="actions" />
                </div>
            </div>
        </template>

        <!-- Divider sutil -->
        <template #subtitle>
            <Divider class="!my-0 !border-t !border-[var(--border)]" />
        </template>

        <!-- Contenido -->
        <template #content>
            <div :class="['', dense ? 'p-3' : 'p-4 sm:p-5']">
                <slot />
            </div>
        </template>

        <!-- Footer opcional -->
        <template #footer>
            <div :class="['border-t border-[var(--border)]', dense ? 'p-3' : 'p-4 sm:p-5']">
                <slot name="footer" />
            </div>
        </template>
    </Card>
</template>

<style scoped>
/* Nada extra por ahora: todo con tokens y utilidades */
</style>

<script setup lang="ts">
import AppCard from '@/components/AppCard.vue'
import Button from 'primevue/button'
</script>

<template>
    <div class="min-h-screen bg-[var(--surface-1)] p-4 sm:p-6">
        <div class="max-w-3xl mx-auto">
            <AppCard title="Cargar boleta" subtitle="Paso 1 · Subir imagen">
                <div class="text-sm text-[var(--text-muted)]">
                    Aquí irá el componente de subida y las validaciones.
                </div>

                <template #actions>
                    <Button label="Ayuda" icon="pi pi-question-circle" severity="secondary" text />
                </template>

                <template #footer>
                    <div class="flex justify-end">
                        <Button label="Continuar" icon="pi pi-arrow-right" />
                    </div>
                </template>
            </AppCard>
        </div>
    </div>
</template>

<script setup lang="ts">
import Toolbar from 'primevue/toolbar'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import { useUiStore } from '@/stores/ui'
import { useRouter } from 'vue-router'

const ui = useUiStore()
const router = useRouter()

function goHome() {
    router.push({ path: '/' })
}
</script>

<template>
<header data-app-navbar class="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface-0)]/90 backdrop-blur">
        <Toolbar class="max-w-6xl mx-auto px-3 sm:px-4">
            <template #start>
                <div class="flex items-center gap-2 sm:gap-3">
                    <!-- Logo / marca -->
                    <Avatar shape="circle" class="bg-[var(--brand-primary)] text-white" icon="pi pi-receipt" />
                    <button class="text-base sm:text-lg font-semibold hover:opacity-80 transition" @click="goHome"
                        aria-label="Inicio">
                        OCR Splitter
                    </button>
                </div>
            </template>

            <template #center>
                <!-- Links centrados (se ocultan en móvil) -->
                <nav class="hidden md:flex items-center gap-1">
                    <Button label="Subir" text @click="router.push('/')" />
                    <Button label="Grupo" text @click="router.push('/grupo/demo')" />
                    <Button label="Resumen" text @click="router.push('/resumen/demo')" />
                </nav>
            </template>

            <template #end>
                <div class="flex items-center gap-1 sm:gap-2">
                    <!-- Modo oscuro -->
                    <Button :label="ui.dark ? 'Claro' : 'Oscuro'" :icon="ui.dark ? 'pi pi-sun' : 'pi pi-moon'" text
                        @click="ui.toggleDark()" aria-label="Alternar tema" />
                    <!-- Acción secundaria / perfil -->
                    <Button icon="pi pi-user" text aria-label="Perfil" />
                </div>
            </template>
        </Toolbar>
    </header>
</template>

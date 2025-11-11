<script setup lang="ts">
import Toolbar from 'primevue/toolbar'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import { useUiStore } from '@/stores/ui'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const ui = useUiStore()
const router = useRouter()

const auth = useAuthStore()
const { user } = storeToRefs(auth) // reactividad segura

function goHome() {
    router.push({ path: '/' })
}
</script>

<template>
    <header data-app-navbar
        class="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface-0)]/90 backdrop-blur">
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
                    <Button label="Grupo" text @click="router.push('/grupo/grp_demo')" />
                    <Button label="Resumen" text @click="router.push('/resumen/demo')" />
                </nav>
            </template>

            <template #end>
                <div class="flex items-center gap-2">
                    <Button :label="ui.dark ? 'Claro' : 'Oscuro'" :icon="ui.dark ? 'pi pi-sun' : 'pi pi-moon'" text
                        @click="ui.toggleDark()" />
                    <template v-if="user">
                        <span class="text-sm opacity-80 mr-2">{{ user?.email }}</span>
                        <Button icon="pi pi-sign-out" text @click="auth.signOutApp()" />
                    </template>
                    <template v-else>
                        <Button label="Entrar" text @click="router.push('/login')" />
                    </template>
                </div>
            </template>
        </Toolbar>
    </header>
</template>

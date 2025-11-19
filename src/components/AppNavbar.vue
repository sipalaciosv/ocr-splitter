<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import Toolbar from 'primevue/toolbar'
import Button from 'primevue/button'
import { useUiStore } from '@/stores/ui'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const ui = useUiStore()
const auth = useAuthStore()
const router = useRouter()

const { user } = storeToRefs(auth)

// --- Detectar si estamos en “desktop” por ancho de ventana ---
const isDesktop = ref(false)

const updateIsDesktop = () => {
    // mismo breakpoint que md: (768px)
    isDesktop.value = window.innerWidth >= 768
}

onMounted(() => {
    updateIsDesktop()
    window.addEventListener('resize', updateIsDesktop)
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', updateIsDesktop)
})

// Nombre amigable para mostrar en el navbar
const userName = computed(
    () => user.value?.displayName || user.value?.email || 'Invitado',
)

function goHome() {
    router.push({ path: '/' })
}
</script>

<template>
    <Toolbar class="border-none rounded-none">
        <template #start>
            <!-- Logo / título -->
            <button type="button" class="flex items-center gap-2" @click="goHome">
                <span class="pi pi-receipt text-lg" />
                <span class="font-semibold text-sm md:text-base">
                    OCR Splitter
                </span>
            </button>
        </template>

        <template #end>
            <!-- DESKTOP: nombre + textos + iconos -->
            <div v-if="isDesktop" class="flex items-center gap-4">
                <span class="text-sm text-[var(--p-text-color-secondary)]">
                    {{ userName }}
                </span>

                <!-- Botón modo claro/oscuro con texto -->
                <Button severity="secondary" text size="small" :icon="ui.dark ? 'pi pi-sun' : 'pi pi-moon'"
                    :label="ui.dark ? 'Modo claro' : 'Modo oscuro'" @click="ui.toggleDark()" />

                <!-- Botón cerrar sesión con texto -->
                <Button severity="secondary" text size="small" icon="pi pi-sign-out" label="Cerrar sesión"
                    @click="auth.signOutApp()" />
            </div>

            <!-- MOBILE: solo iconos -->
            <div v-else class="flex items-center gap-2">
                <Button severity="secondary" text rounded size="small" :icon="ui.dark ? 'pi pi-sun' : 'pi pi-moon'"
                    aria-label="Cambiar tema" @click="ui.toggleDark()" />
                <Button severity="secondary" text rounded size="small" icon="pi pi-sign-out" aria-label="Cerrar sesión"
                    @click="auth.signOutApp()" />
            </div>
        </template>
    </Toolbar>
</template>

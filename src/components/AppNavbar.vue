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

const isDesktop = ref(false)

const updateIsDesktop = () => {
    isDesktop.value = window.innerWidth >= 768
}

onMounted(() => {
    updateIsDesktop()
    window.addEventListener('resize', updateIsDesktop)
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', updateIsDesktop)
})

const isLoggedIn = computed(() => !!user.value)

const userName = computed(
    () => user.value?.displayName || user.value?.email || 'Invitado',
)

function goHome() {
    router.push({ name: 'home' })
}

async function handleSignOut() {
    if (!isLoggedIn.value) return
    await auth.signOutApp()
    router.push({ name: 'login' })
}

function goLogin() {
    router.push({ name: 'login' })
}
</script>

<template>
    <header data-app-navbar class="border-b border-[var(--border)] bg-[var(--surface-0)]">
        <Toolbar class="border-none rounded-none max-w-6xl mx-auto px-3 sm:px-4">
            <template #start>
                <button type="button" class="inline-flex items-center gap-2 rounded-full px-2.5 py-1
                 hover:bg-[var(--surface-1)] transition-colors" @click="goHome">
                    <span class="pi pi-receipt text-base" />
                    <span class="flex flex-col text-left leading-tight">
                        <span class="text-sm font-semibold">
                            OCR Splitter
                        </span>
                        <span class="text-[10px] uppercase tracking-[0.18em]
                     text-[var(--text-muted)]">

                        </span>
                    </span>
                </button>
            </template>

            <template #end>
                <div v-if="isDesktop" class="flex items-center gap-4">
                    <span v-if="isLoggedIn" class="text-sm text-[var(--p-text-color-secondary)]">
                        {{ userName }}
                    </span>

                    <Button severity="secondary" text size="small" :icon="ui.dark ? 'pi pi-sun' : 'pi pi-moon'"
                        :label="ui.dark ? 'Modo claro' : 'Modo oscuro'" @click="ui.toggleDark()" />

                    <Button v-if="isLoggedIn" severity="secondary" text size="small" icon="pi pi-sign-out"
                        label="Cerrar sesión" @click="handleSignOut" />

                    <Button v-else severity="secondary" text size="small" icon="pi pi-user" label="Iniciar sesión"
                        @click="goLogin" />
                </div>

                <div v-else class="flex items-center gap-2">
                    <Button severity="secondary" text rounded size="small" :icon="ui.dark ? 'pi pi-sun' : 'pi pi-moon'"
                        aria-label="Cambiar tema" @click="ui.toggleDark()" />

                    <Button v-if="isLoggedIn" severity="secondary" text rounded size="small" icon="pi pi-sign-out"
                        aria-label="Cerrar sesión" @click="handleSignOut" />

                    <Button v-else severity="secondary" text rounded size="small" icon="pi pi-user"
                        aria-label="Iniciar sesión" @click="goLogin" />
                </div>
            </template>
        </Toolbar>
    </header>
</template>

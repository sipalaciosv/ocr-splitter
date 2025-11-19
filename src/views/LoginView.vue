<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppCard from '@/components/AppCard.vue'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { joinGroup } from '@/services/db'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const toast = useToast()

const email = ref('')
const password = ref('')
const isSignUp = ref(false)

async function submit() {
    try {
        // 1) Login o registro
        if (isSignUp.value) {
            await auth.signUp(email.value, password.value)
        } else {
            await auth.signIn(email.value, password.value)
        }

        // 2) Normalizamos el redirect
        const redirectRaw = route.query.redirect
        const redirect: string =
            typeof redirectRaw === 'string'
                ? redirectRaw
                : '/'

        // 3) Caso especial: link de invitación (/join/:id)
        if (redirect.startsWith('/join/')) {
            const parts = redirect.split('/')
            const last = parts[parts.length - 1]
            const groupId: string = last ?? ''

            const u = auth.user // Pinia unwrapping: User | null
            if (!u) {
                // Si por timing aún no está seteado el usuario en el store
                toast.add({
                    severity: 'warn',
                    summary: 'Sesión inicializando',
                    detail: 'Si no entras al grupo, recarga la página e inténtalo de nuevo.',
                    life: 2500,
                })
                return router.replace(redirect)
            }

            try {
                // 👇 Aquí todo es string o null, sin undefined
                await joinGroup(groupId, u.uid, {
                    displayName: u.displayName ?? null,
                    email: u.email ?? null,
                    photoURL: u.photoURL ?? null,
                })
            } catch (e: any) {
                toast.add({
                    severity: 'error',
                    summary: 'No se pudo unir al grupo',
                    detail: e?.message ?? String(e),
                    life: 3000,
                })
                return router.replace(redirect)
            }

            // Todo ok → directo al tablero del grupo
            return router.replace({ name: 'grupo', params: { id: groupId } })
        }

        // 4) Caso normal (no venía de /join/:id)
        router.replace(redirect)
    } catch (e: any) {
        toast.add({
            severity: 'error',
            summary: 'Auth error',
            detail: e?.message ?? String(e),
            life: 3000,
        })
    }
}
</script>


<template>
    <div class="max-w-md mx-auto">
        <AppCard :title="isSignUp ? 'Crear cuenta' : 'Iniciar sesión'">
            <div class="space-y-3">
                <div>
                    <label class="text-xs block mb-1">Correo</label>
                    <InputText v-model="email" class="w-full" />
                </div>
                <div>
                    <label class="text-xs block mb-1">Contraseña</label>
                    <Password v-model="password" class="w-full" :feedback="false" toggleMask />
                </div>
                <Button :label="isSignUp ? 'Registrarme' : 'Entrar'" class="w-full" @click="submit" />
                <Button :label="isSignUp ? 'Tengo cuenta, iniciar sesión' : 'Crear cuenta nueva'" text class="w-full"
                    @click="isSignUp = !isSignUp" />
            </div>
        </AppCard>
    </div>
</template>

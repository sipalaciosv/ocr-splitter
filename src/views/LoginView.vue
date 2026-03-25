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

function authErrorMessage(e: any): string {
    const code = e?.code as string | undefined
    if (!code) {
        return 'Ocurrió un error al autenticar. Inténtalo de nuevo.'
    }

    switch (code) {
        case 'auth/invalid-email':
            return 'El correo no tiene un formato válido. Ej: nombre@dominio.cl'
        case 'auth/user-not-found':
            return 'No existe una cuenta con este correo.'
        case 'auth/wrong-password':
            return 'Contraseña incorrecta. Revisa tus datos e inténtalo de nuevo.'
        case 'auth/email-already-in-use':
            return 'Ya existe una cuenta con este correo.'
        case 'auth/weak-password':
            return 'La contraseña es demasiado débil (mínimo 6 caracteres).'
        case 'auth/too-many-requests':
            return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.'
        default:
            return 'Ocurrió un error al autenticar. Revisa tus datos e inténtalo de nuevo.'
    }
}

async function submit() {
    if (!email.value || !password.value) {
        toast.add({
            severity: 'warn',
            summary: 'Datos incompletos',
            detail: 'Ingresa correo y contraseña para continuar.',
            life: 2500,
        })
        return
    }

    try {
        if (isSignUp.value) {
            await auth.signUp(email.value, password.value)
        } else {
            await auth.signIn(email.value, password.value)
        }

        const redirectRaw = route.query.redirect
        const redirect: string =
            typeof redirectRaw === 'string'
                ? redirectRaw
                : '/app'

        if (redirect.startsWith('/join/')) {
            const parts = redirect.split('/')
            const last = parts[parts.length - 1]
            const groupId: string = last ?? ''

            const u = auth.user
            if (!u) {
                toast.add({
                    severity: 'warn',
                    summary: 'Sesión inicializando',
                    detail: 'Si no entras al grupo, recarga la página e inténtalo de nuevo.',
                    life: 2500,
                })
                return router.replace(redirect)
            }

            try {
                await joinGroup(groupId, u.uid, {
                    displayName: u.displayName ?? null,
                    email: u.email ?? null,
                    photoURL: u.photoURL ?? null,
                })
            } catch (err: any) {
                toast.add({
                    severity: 'error',
                    summary: 'No se pudo unir al grupo',
                    detail: err?.message ?? String(err),
                    life: 3000,
                })
                return router.replace(redirect)
            }

            return router.replace({ name: 'grupo', params: { id: groupId } })
        }

        router.replace(redirect)
    } catch (e: any) {
        toast.add({
            severity: 'error',
            summary: isSignUp.value ? 'Error al crear cuenta' : 'Error al iniciar sesión',
            detail: authErrorMessage(e),
            life: 3500,
        })
    }
}
</script>

<template>
    <div class="max-w-md mx-auto py-8">
        <AppCard dense>
            <template #header>
                <div class="space-y-2">
                    <span class="inline-flex items-center rounded-full border border-[var(--border)]
                   px-3 py-1 text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
                        {{ isSignUp ? 'Crear cuenta' : 'Iniciar sesión' }}
                    </span>
                    <h1 class="text-lg sm:text-xl font-semibold leading-tight">
                        {{ isSignUp ? 'Empieza a dividir tus boletas' : 'Bienvenido a CuentasClaras' }}
                    </h1>
                    <p class="text-xs text-[var(--text-muted)]">

                    </p>
                </div>
            </template>

            <div class="space-y-4 pt-1">
                <div class="space-y-1">
                    <label class="text-xs font-medium">Correo</label>
                    <InputText v-model="email" class="w-full" placeholder="tucorreo@ejemplo.cl" />
                </div>

                <div class="space-y-1">
                    <label class="text-xs font-medium">Contraseña</label>
                    <Password v-model="password" class="w-full" :feedback="false" toggleMask />
                </div>

                <Button :label="isSignUp ? 'Crear cuenta y entrar' : 'Entrar'" class="w-full mt-2" @click="submit" />

                <div class="border-t border-[var(--border)] pt-3 mt-3 flex items-center justify-between text-xs">
                    <span class="text-[var(--text-muted)]">
                        {{ isSignUp ? '¿Ya tienes cuenta?' : '¿Aún no tienes cuenta?' }}
                    </span>
                    <Button :label="isSignUp ? 'Iniciar sesión' : 'Crear cuenta nueva'" text size="small"
                        @click="isSignUp = !isSignUp" />
                </div>
            </div>
        </AppCard>
    </div>
</template>

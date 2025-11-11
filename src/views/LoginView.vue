<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppCard from '@/components/AppCard.vue'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const toast = useToast()

const email = ref('')
const password = ref('')
const isSignUp = ref(false)

async function submit() {
    try {
        if (isSignUp.value) {
            await auth.signUp(email.value, password.value)
        } else {
            await auth.signIn(email.value, password.value)
        }
        const redirect = (route.query.redirect as string) ?? '/'
        router.replace(redirect)
    } catch (e: any) {
        toast.add({ severity: 'error', summary: 'Auth error', detail: e?.message ?? String(e), life: 3000 })
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

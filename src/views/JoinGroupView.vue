<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { joinGroup } from '@/services/db'
import AppCard from '@/components/AppCard.vue'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const groupId = computed(() => String(route.params.id))

async function doJoin() {
    if (!auth.user) return router.push({ name: 'login', query: { redirect: route.fullPath } })
    await joinGroup(groupId.value, auth.user.uid, {
        displayName: auth.user.displayName,
        email: auth.user.email,
        photoURL: auth.user.photoURL
    })
    try {
        await joinGroup(groupId.value, auth.user.uid)
        toast.add({ severity: 'success', summary: 'Te uniste al grupo', life: 2000 })
        router.replace({ name: 'grupo', params: { id: groupId.value } })
    } catch (e: any) {
        toast.add({ severity: 'error', summary: 'Error al unirse', detail: e?.message ?? String(e), life: 3000 })
    }
}
</script>

<template>
    <div class="max-w-lg mx-auto">
        <AppCard :title="`Unirse al grupo ${groupId}`" subtitle="Necesitas pertenecer para ver la boleta">
            <div class="space-y-3">
                <p class="text-sm text-[var(--text-muted)]">
                    Presiona el botón para unirte a este grupo con tu cuenta actual.
                </p>
                <Button label="Unirme al grupo" icon="pi pi-user-plus" class="w-full" @click="doJoin" />
            </div>
        </AppCard>
    </div>
</template>

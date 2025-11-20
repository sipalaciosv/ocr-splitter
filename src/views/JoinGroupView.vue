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
  if (!auth.user) {
    return router.push({ name: 'login', query: { redirect: route.fullPath } })
  }

  try {
    await joinGroup(groupId.value, auth.user.uid, {
      displayName: auth.user.displayName ?? null,
      email: auth.user.email ?? null,
      photoURL: auth.user.photoURL ?? null,
    })

    toast.add({ severity: 'success', summary: 'Te uniste al grupo', life: 2000 })
    router.replace({ name: 'grupo', params: { id: groupId.value } })
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'Error al unirse',
      detail: e?.message ?? String(e),
      life: 3000,
    })
  }
}

function goToLogin() {
  router.push({ name: 'login', query: { redirect: route.fullPath } })
}
</script>

<template>
  <div class="max-w-md mx-auto">
    <AppCard title="Unirse al grupo" :subtitle="`Código de grupo: ${groupId}`">
      <div class="space-y-3 text-sm">
        <p>
          Has sido invitado a participar en este grupo. Para unirte, inicia sesión o crea una cuenta.
        </p>

        <p class="text-xs text-[var(--text-muted)]">
          Una vez dentro, podrás ver la boleta y tomar los ítems que te correspondan.
        </p>

        <div class="pt-2">
          <Button v-if="!auth.user" label="Iniciar sesión / Registrarme" icon="pi pi-user" class="w-full"
            @click="goToLogin" />

          <Button v-else label="Unirme al grupo ahora" icon="pi pi-check" class="w-full" @click="doJoin" />
        </div>
      </div>
    </AppCard>
  </div>
</template>

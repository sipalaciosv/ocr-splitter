// tu vista JoinGroup (la que pegaste antes)
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
      displayName: auth.user.displayName,
      email: auth.user.email,
      photoURL: auth.user.photoURL,
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
</script>

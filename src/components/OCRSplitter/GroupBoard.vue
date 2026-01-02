<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import AppCard from '@/components/AppCard.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import MultiSelect from 'primevue/multiselect'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Divider from 'primevue/divider'
import Dialog from 'primevue/dialog'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth'

import {
  getGroupById,
  subscribeMembers,
  subscribeItems,
  seedItems,
  setItemAssignments,
  claimItem,
  unclaimItem,
} from '@/services/db'



type Props = { groupId: string }
const props = defineProps<Props>()

// Tipo local para items
type Item = {
  id: string
  name: string
  price: number
  qty: number
  assignedUserIds: string[]
}

const toast = useToast()
const auth = useAuthStore()

const loading = ref(true)
const groupTitle = ref<string | null>(null)
const items = ref<{ id: string; name: string; price: number; qty: number; assignedUserIds: string[] }[]>([])

const members = ref<{ uid: string; name: string; role: 'admin' | 'member' }[]>([])
const users = ref<{ id: string; nombre: string }[]>([])
let offMembers: (() => void) | null = null
const currentUserId = computed(() => auth.user?.uid ?? '')
const isAdmin = computed(() =>
  members.value.some(m => m.uid === currentUserId.value && m.role === 'admin')
)

const expandedItems = ref<string[]>([])

function isExpanded(id: string) {
  return expandedItems.value.includes(id)
}

function toggleExpanded(id: string) {
  const idx = expandedItems.value.indexOf(id)
  if (idx === -1) expandedItems.value.push(id)
  else expandedItems.value.splice(idx, 1)
}

function visibleAssigned(id: string, assigned?: string[]) {
  const list = assigned ?? []
  if (isExpanded(id) || list.length <= 2) return list
  return list.slice(0, 2)
}

let offItems: (() => void) | null = null

const currency = (n: number) =>
  n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })

onMounted(async () => {
  try {
    loading.value = true

    const g = await getGroupById(props.groupId)
    if (!g) {
      toast.add({ severity: 'warn', summary: 'Grupo no encontrado', life: 3000 })
      return
    }
    groupTitle.value = g.title

    try {
      offMembers = subscribeMembers(props.groupId, (rows) => {
        members.value = rows.map((r) => ({
          uid: r.uid,
          role: r.role,
          name: r.displayName || r.email || r.uid,
        }))

        users.value = members.value.map((m) => ({
          id: m.uid,
          nombre: m.name,
        }))
      })
    } catch {
      members.value = []
      users.value = []
    }

    offItems = subscribeItems(props.groupId, (rows) => {
      items.value = rows.map(r => ({
        id: r.id,
        name: r.name,
        price: r.price,
        qty: r.qty,
        assignedUserIds: [...(r.assignedUserIds ?? [])],
      }))
    })
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error cargando grupo', detail: String(e), life: 4500 })
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  offItems?.()
  offMembers?.()
})

const itemSubtotal = (it: Item) => it.price * it.qty
const assignedCount = (it: Item) => it.assignedUserIds?.length ?? 0

const sharePerPerson = (it: Item) => {
  const count = assignedCount(it) || 1
  return itemSubtotal(it) / count
}


const totalsByUser = computed(() => {
  const acc: Record<string, number> = {}
  users.value.forEach(u => (acc[u.id] = 0))
  for (const it of items.value) {
    const assigned = it.assignedUserIds ?? []
    if (!assigned.length) continue
    const share = itemSubtotal(it) / assigned.length
    for (const uid of assigned) {
      acc[uid] = (acc[uid] ?? 0) + share
    }
  }
  return acc
})

const totalGeneral = computed(() => items.value.reduce((s, it) => s + itemSubtotal(it), 0))

const totalAsignado = computed(() => {
  let s = 0
  for (const it of items.value) {
    const c = it.assignedUserIds?.length ?? 0
    if (c > 0) s += itemSubtotal(it)
  }
  return s
})


const userLabel = (id: string) => users.value.find(u => u.id === id)?.nombre ?? id


async function onAdminAssignChange(it: Item, newList: string[]) {
  try {
    await setItemAssignments(props.groupId, it.id, newList)
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'No se pudo actualizar', detail: e?.message ?? String(e), life: 2500 })
  }
}

async function clearAssignments() {
  if (!isAdmin.value) return
  try {
    await Promise.all(items.value.map(it => setItemAssignments(props.groupId, it.id, [])))
    toast.add({ severity: 'info', summary: 'Asignaciones reiniciadas', life: 2500 })
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'Error al reiniciar', detail: e?.message ?? String(e), life: 2500 })
  }
}

async function fillMyself(uid: string) {
  if (!isAdmin.value || !uid) return
  try {
    await Promise.all(items.value.map(it => setItemAssignments(props.groupId, it.id, [uid])))
    toast.add({ severity: 'success', summary: 'Te asignaste todos los ítems', life: 2500 })
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'Error al asignar', detail: e?.message ?? String(e), life: 2500 })
  }
}


async function toggleSelf(it: Item, want: boolean) {
  if (!currentUserId.value) return
  try {
    if (want) {
      await claimItem(props.groupId, it.id, currentUserId.value)
      toast.add({
        severity: 'success',
        summary: `Te agregaste a "${it.name}"`,
        life: 2000,
      })
    } else {
      await unclaimItem(props.groupId, it.id, currentUserId.value)
      toast.add({
        severity: 'info',
        summary: `Te quitaste de "${it.name}"`,
        life: 2000,
      })
    }
  } catch (e: any) {
    const detail =
      e?.code === 'permission-denied'
        ? 'Solo puedes agregarte o quitarte tú.'
        : e?.message ?? String(e)

    toast.add({
      severity: 'error',
      summary: 'No se pudo actualizar',
      detail,
      life: 2500,
    })
  }
}


const joinUrl = computed(() => {
  if (typeof window === 'undefined') return ''
  const origin = window.location.origin
  return `${origin}/join/${props.groupId}`
})
function copyLink() {
  const url = joinUrl.value
  if (!url) return
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(url)
    toast.add({ severity: 'success', summary: 'Link de invitación copiado', life: 2000 })
  }
}
async function shareLink() {
  const url = joinUrl.value
  if (!url || typeof navigator === 'undefined') return
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title: groupTitle.value ?? 'Grupo', url })
    } catch {

    }
  } else if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url)
    toast.add({
      severity: 'info',
      summary: 'Compartir no disponible; link copiado',
      life: 2500,
    })
  }
}
</script>

<template>
  <div class="max-w-6xl w-full mx-auto px-3 sm:px-4 pt-6 sm:pt-8 md:pt-10 pb-8">
    <AppCard>

      <template #header>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="min-w-0 space-y-2">
            <!-- Nombre del grupo -->
            <h1 class="text-base sm:text-xl font-semibold leading-tight truncate">
              {{ groupTitle ?? 'Grupo' }}
            </h1>

            <div class="flex flex-wrap items-center gap-2">
              <Tag icon="pi pi-bolt" value="En vivo · sincronizado" rounded />
              <Tag value="ADMIN" rounded />
            </div>

            <!-- Línea secundaria -->
            <p class="text-xs text-[var(--text-muted)]">
              Boleta · {{ items.length }} ítems ·
              Total {{ currency(totalGeneral) }}
            </p>
          </div>


          <div class="flex flex-wrap justify-end gap-2">
            <Button v-if="isAdmin" label="Reiniciar" icon="pi pi-refresh" size="small" severity="danger" outlined
              :disabled="loading" @click="clearAssignments" />
          </div>
        </div>
      </template>


      <div class="board-layout">

        <div>
          <div class="rounded-2xl border border-[var(--border)] bg-[var(--surface-0)] shadow-sm">
            <div class="p-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div class="font-medium text-sm sm:text-base">Ítems de la boleta</div>
              <div class="text-xs sm:text-sm text-[var(--text-muted)]">
                Divide seleccionando miembros
                <span v-if="!isAdmin" class="block sm:inline">
                  · Solo puedes agregarte o quitarte tú
                </span>
              </div>
            </div>


            <div class="board-desktop">
              <DataTable :value="items" dataKey="id" :loading="loading" tableStyle="width: 100%;" class="text-sm"
                size="small" :rows="10" paginator :rowsPerPageOptions="[10, 20, 50]">
                <Column header="Ítem" style="width: 55%">
                  <template #body="{ data }">
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <div class="font-medium truncate">
                          {{ data.name }}
                        </div>

                        <div v-if="(data.assignedUserIds?.length ?? 0) > 0" class="mt-1 flex flex-wrap gap-1">
                          <Tag v-for="uid in visibleAssigned(data.id, data.assignedUserIds)" :key="uid"
                            :value="userLabel(uid)" rounded class="text-[11px]" />
                          <button v-if="(data.assignedUserIds?.length ?? 0) > 2" type="button"
                            class="text-[11px] underline-offset-2 hover:underline text-[var(--text-muted)]"
                            @click="toggleExpanded(data.id)">
                            {{
                              isExpanded(data.id)
                                ? 'Ver menos'
                                : `+${(data.assignedUserIds?.length ?? 0) - 2}`
                            }}
                          </button>
                        </div>
                      </div>

                      <div class="text-right text-xs leading-snug shrink-0">
                        <div class="tabular-nums font-semibold">
                          {{ currency(itemSubtotal(data)) }}
                        </div>

                        <div class="tabular-nums text-[var(--text-muted)]">
                          {{ currency(sharePerPerson(data)) }}
                          × {{ assignedCount(data) || 1 }}
                        </div>
                      </div>
                    </div>
                  </template>
                </Column>

                <Column field="qty" header="Cant." sortable style="width: 10%" bodyClass="text-center tabular-nums" />

                <Column header="Asignado a" style="width: 35%">
                  <template #body="{ data }">
                    <template v-if="isAdmin">
                      <MultiSelect :modelValue="data.assignedUserIds"
                        @update:modelValue="(v) => onAdminAssignChange(data, v)" :options="users" optionLabel="nombre"
                        optionValue="id" :filter="false" :showToggleAll="false" class="multi-assign"
                        placeholder="Selecciona personas…" />
                    </template>

                    <template v-else>
                      <div v-if="(data.assignedUserIds?.length ?? 0) > 0"
                        class="mb-2 flex flex-wrap items-center gap-1">
                        <Tag v-for="uid in visibleAssigned(data.id, data.assignedUserIds)" :key="uid"
                          :value="userLabel(uid)" rounded class="text-xs" />
                        <button v-if="(data.assignedUserIds?.length ?? 0) > 2" type="button"
                          class="text-[11px] underline-offset-2 hover:underline text-[var(--text-muted)]"
                          @click="toggleExpanded(data.id)">
                          {{
                            isExpanded(data.id)
                              ? 'Ver menos'
                              : `+${(data.assignedUserIds?.length ?? 0) - 2}`
                          }}
                        </button>
                      </div>

                      <div class="flex flex-wrap gap-2">
                        <Button label="Tomar" size="small" @click="toggleSelf(data, true)"
                          :disabled="(data.assignedUserIds ?? []).includes(currentUserId)" />
                        <Button label="Quitarme" size="small" severity="secondary" @click="toggleSelf(data, false)"
                          :disabled="!(data.assignedUserIds ?? []).includes(currentUserId)" />
                      </div>
                    </template>
                  </template>
                </Column>
              </DataTable>
            </div>

            <div class="board-mobile border-t border-[var(--border)]">
              <div v-for="it in items" :key="it.id"
                class="px-3 py-3 border-b border-[var(--border)] flex flex-col gap-2 text-xs">
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <div class="font-medium truncate">{{ it.name }}</div>
                    <div v-if="(it.assignedUserIds?.length ?? 0) > 0" class="text-[11px] text-[var(--text-muted)]">
                      Compartido entre {{ it.assignedUserIds?.length ?? 0 }}
                    </div>
                  </div>

                  <div class="text-right text-[11px] leading-snug">
                    <div class="tabular-nums font-semibold">
                      {{ currency(it.price * it.qty) }}
                    </div>
                    <div class="tabular-nums text-[var(--text-muted)]">
                      {{ currency(it.price) }} × {{ it.qty }}
                    </div>
                  </div>
                </div>

                <div class="flex flex-col gap-2 mt-1">
                  <template v-if="isAdmin">
                    <MultiSelect :modelValue="it.assignedUserIds" @update:modelValue="(v) => onAdminAssignChange(it, v)"
                      :options="users" optionLabel="nombre" optionValue="id" display="chip" :filter="false"
                      :showToggleAll="false" :maxSelectedLabels="3" class="w-full text-xs multi-assign"
                      placeholder="Selecciona personas…" />
                  </template>
                  <template v-else>
                  </template>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div>
          <div class="rounded-2xl border border-[var(--border)] bg-[var(--surface-0)] shadow-sm">
            <div class="p-4">
              <div class="font-medium">Resumen</div>
              <div class="text-xs text-[var(--text-muted)]">
                Se reparte proporcionalmente por ítem
              </div>

              <Divider class="my-3" />

              <div class="flex justify-between text-sm mb-1">
                <span>Total boleta</span>
                <span class="font-medium">{{ currency(totalGeneral) }}</span>
              </div>
              <div class="flex justify-between text-sm mb-4">
                <span>Ítems asignados</span>
                <span class="font-medium">{{ currency(totalAsignado) }}</span>
              </div>

              <div class="text-xs text-[var(--text-muted)] mb-2">
                Totales por persona
              </div>
              <div class="space-y-2">
                <div v-for="u in users" :key="u.id" class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="h-6 w-6 rounded-full bg-[var(--surface-1)] grid place-items-center text-xs">
                      {{ u.nombre.charAt(0).toUpperCase() }}
                    </div>
                    <span class="text-sm truncate max-w-[10rem]">
                      {{ u.nombre }}
                    </span>
                  </div>
                  <div class="font-semibold tabular-nums">
                    {{ currency(totalsByUser[u.id] ?? 0) }}
                  </div>
                </div>
              </div>

              <Divider class="my-3" />

              <div class="flex flex-col sm:flex-row gap-2">
                <Button label="Copiar link del grupo" icon="pi pi-link" class="w-full" @click="copyLink" />
                <Button label="Compartir" icon="pi pi-share-alt" severity="secondary" class="w-full"
                  @click="shareLink" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppCard>
  </div>
</template>

<style scoped>
.board-layout {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 1024px) {
  .board-layout {
    display: grid;
    grid-template-columns: minmax(0, 2.2fr) minmax(0, 1fr);
    align-items: flex-start;
    gap: 1.25rem;
  }
}

.board-desktop {
  display: none;
}

.board-mobile {
  display: block;
}

@media (min-width: 768px) {
  .board-desktop {
    display: block;
  }

  .board-mobile {
    display: none;
  }
}

.multi-assign {
  width: 100%;
}

@media (min-width: 1024px) {
  .multi-assign {
    width: auto;
    max-width: 12rem;
  }
}

.multi-assign :deep(.p-multiselect-label) {
  min-height: 1.75rem;
  padding-block: 0.15rem;
  font-size: 0.75rem;
}

.multi-assign :deep(.p-multiselect-trigger) {
  width: 1.75rem;
}

@media (min-width: 640px) {
  .multi-assign :deep(.p-multiselect-token) {
    display: none;
  }
}

@media (max-width: 639px) {
  .multi-assign :deep(.p-multiselect-token) {
    padding-block: 0.05rem;
    padding-inline: 0.35rem;
    font-size: 0.7rem;
  }
}

@media (min-width: 640px) {
  .multi-assign :deep(.p-multiselect-label) {
    color: transparent;
  }
}
</style>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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
import { listMembers } from '@/services/db'

import {
    mockGetGroupById,
    mockGetReceiptById,
    mockListUsersByIds,
    type MockGroup,
    type MockUser,
    type MockReceipt,
    type MockReceiptItem
} from '@/services/mocks'

type Props = { groupId: string }
const props = defineProps<Props>()

const toast = useToast()
const auth = useAuthStore()

const loading = ref(true)
const group = ref<MockGroup | null>(null)
const users = ref<MockUser[]>([])
const receipt = ref<MockReceipt | null>(null)
const items = ref<MockReceiptItem[]>([]) // working copy en memoria

// miembros reales (Firestore)
const members = ref<{ uid: string; name: string; role: 'admin' | 'member' }[]>([])

const currentUserId = computed(() => auth.user?.uid ?? '')
const isAdmin = computed(() => group.value?.ownerUid === currentUserId.value)

// ver boleta
const showReceipt = ref(false)

const currency = (n: number) =>
    n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })

onMounted(async () => {
    try {
        loading.value = true

        // 1) Grupo mock (hasta integrar backend real)
        const g = await mockGetGroupById(props.groupId)
        if (!g) {
            toast.add({ severity: 'warn', summary: 'Grupo no encontrado', life: 3000 })
            return
        }
        group.value = g

        // 2) Miembros desde Firestore (si existen)
        try {
            const rows = await listMembers(props.groupId)
            members.value = rows.map(r => ({
                uid: r.uid,
                role: r.role,
                name: r.displayName || r.email || r.uid
            }))
        } catch {
            members.value = []
        }

        // Users que alimentan el MultiSelect / chips
        if (members.value.length > 0) {
            users.value = members.value.map(m => ({ id: m.uid, nombre: m.name }))
        } else {
            // fallback demo
            users.value = await mockListUsersByIds(g.miembros)
        }

        // 3) Receipt mock
        const r = await mockGetReceiptById(g.receiptId)
        receipt.value = r

        // working copy de items
        items.value = r.items.map(i => ({
            ...i,
            assignedUserIds: [...(i.assignedUserIds ?? [])]
        }))
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Error cargando grupo', detail: String(e), life: 4500 })
    } finally {
        loading.value = false
    }
})

/** Subtotales por ítem */
const itemSubtotal = (it: MockReceiptItem) => it.price * it.qty

/** Totales por persona = sum(itemSubtotal / #asignados) */
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

/** UI Helpers */
const userLabel = (id: string) => users.value.find(u => u.id === id)?.nombre ?? id

function clearAssignments() {
    if (!isAdmin.value) return
    items.value = items.value.map(i => ({ ...i, assignedUserIds: [] }))
    toast.add({ severity: 'info', summary: 'Asignaciones reiniciadas', life: 2500 })
}

function fillMyself(uid: string) {
    // solo admin (para no pisar a otros)
    if (!isAdmin.value) return
    items.value = items.value.map(i => ({ ...i, assignedUserIds: [uid] }))
    toast.add({ severity: 'success', summary: 'Te asignaste todos los ítems', life: 2500 })
}

// Solo auto-asignación para miembros (no admin)
function toggleSelf(it: MockReceiptItem, want: boolean) {
    const set = new Set(it.assignedUserIds ?? [])
    if (want) set.add(currentUserId.value)
    else set.delete(currentUserId.value)
    it.assignedUserIds = Array.from(set)
}

// Link compartir
const currentUrl = computed(() => (typeof window !== 'undefined' ? window.location.href : ''))

function copyLink() {
    const url = currentUrl.value
    if (!url) return
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(url)
        toast.add({ severity: 'success', summary: 'Link copiado', life: 2000 })
    }
}

async function shareLink() {
    const url = currentUrl.value
    if (!url || typeof navigator === 'undefined') return
    if (typeof navigator.share === 'function') {
        try {
            await navigator.share({ title: group.value?.nombre ?? 'Grupo', url })
        } catch {
            /* cancelado por el usuario */
        }
    } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
        toast.add({ severity: 'info', summary: 'Compartir no disponible; link copiado', life: 2500 })
    }
}
</script>

<template>
    <div class="max-w-6xl mx-auto px-3 sm:px-4 pt-6 sm:pt-8 md:pt-10 pb-8">
        <AppCard>
            <template #header>
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div class="min-w-0">
                        <div class="font-semibold text-lg leading-tight">
                            {{ group?.nombre ?? 'Grupo' }}
                        </div>
                        <div class="text-xs opacity-70">
                            Boleta: {{ receipt?.titulo ?? '—' }} · Ítems: {{ items.length }} · Total boleta:
                            {{ currency(totalGeneral) }}
                        </div>
                    </div>

                    <div class="flex flex-wrap gap-2">
                        <Button label="Ver boleta" icon="pi pi-image" severity="secondary"
                            @click="showReceipt = true" />
                        <Button :disabled="loading || !isAdmin" label="Reiniciar asignaciones"
                            @click="clearAssignments" />
                        <Button :disabled="loading || !isAdmin" label="Asignarme todo" severity="secondary"
                            @click="fillMyself(group?.miembros[0] ?? '')" />
                    </div>
                </div>
            </template>

            <div class="grid gap-4 lg:grid-cols-12">
                <!-- IZQUIERDA: Tabla de ítems -->
                <div class="lg:col-span-8">
                    <div
                        class="rounded-2xl border border-[color:var(--ring)] bg-[var(--cardbg)] shadow-sm overflow-hidden">
                        <div class="p-4 flex items-center justify-between">
                            <div class="font-medium">Ítems de la boleta</div>
                            <div class="text-sm opacity-70">Divide seleccionando miembros</div>
                        </div>

                        <DataTable :value="items" dataKey="id" :loading="loading" tableStyle="min-width: 100%"
                            class="text-sm" :rows="10" paginator :rowsPerPageOptions="[10, 20, 50]">
                            <Column field="name" header="Producto" sortable style="width: 32%">
                                <template #body="{ data }">
                                    <div class="font-medium">{{ data.name }}</div>
                                    <div class="text-xs opacity-70" v-if="(data.assignedUserIds?.length ?? 0) > 0">
                                        Compartido entre {{ data.assignedUserIds.length }}
                                    </div>
                                </template>
                            </Column>

                            <Column field="price" header="Precio" sortable style="width: 14%">
                                <template #body="{ data }">{{ currency(data.price) }}</template>
                            </Column>

                            <Column field="qty" header="Cant." sortable style="width: 10%" />

                            <Column header="Subtotal" sortable style="width: 18%">
                                <template #body="{ data }">
                                    {{ currency(data.price * data.qty) }}
                                </template>
                            </Column>

                            <Column header="Asignado a" style="width: 26%">
                                <template #body="{ data }">
                                    <!-- Admin: edición completa -->
                                    <template v-if="isAdmin">
                                        <MultiSelect v-model="data.assignedUserIds" :options="users"
                                            optionLabel="nombre" optionValue="id" display="chip" class="w-full"
                                            placeholder="Selecciona personas..." />
                                        <div class="mt-1 flex flex-wrap gap-1"
                                            v-if="(data.assignedUserIds?.length ?? 0) > 0">
                                            <Tag v-for="uid in data.assignedUserIds" :key="uid"
                                                :value="userLabel(uid)" />
                                        </div>
                                    </template>

                                    <!-- Miembro: solo auto-asignación -->
                                    <template v-else>
                                        <div class="flex flex-wrap gap-1 mb-2"
                                            v-if="(data.assignedUserIds?.length ?? 0) > 0">
                                            <Tag v-for="uid in data.assignedUserIds" :key="uid"
                                                :value="userLabel(uid)" />
                                        </div>
                                        <div class="flex gap-2">
                                            <Button label="Yo lo tomo" size="small" @click="toggleSelf(data, true)"
                                                :disabled="(data.assignedUserIds ?? []).includes(currentUserId)" />
                                            <Button label="Quitarme" size="small" severity="secondary"
                                                @click="toggleSelf(data, false)"
                                                :disabled="!(data.assignedUserIds ?? []).includes(currentUserId)" />
                                        </div>
                                    </template>
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                </div>

                <!-- DERECHA: Totales -->
                <div class="lg:col-span-4">
                    <div
                        class="rounded-2xl border border-[color:var(--ring)] bg-[var(--cardbg)] shadow-sm overflow-hidden">
                        <div class="p-4">
                            <div class="font-medium">Resumen</div>
                            <div class="text-xs opacity-70">Se reparte proporcionalmente por ítem</div>

                            <Divider class="my-3" />

                            <div class="flex justify-between text-sm mb-1">
                                <span>Total boleta</span>
                                <span class="font-medium">{{ currency(totalGeneral) }}</span>
                            </div>
                            <div class="flex justify-between text-sm mb-4">
                                <span>Ítems asignados</span>
                                <span class="font-medium">{{ currency(totalAsignado) }}</span>
                            </div>

                            <div class="text-xs opacity-70 mb-2">Totales por persona</div>
                            <div class="space-y-2">
                                <div v-for="u in users" :key="u.id" class="flex items-center justify-between">
                                    <div class="flex items-center gap-2">
                                        <div
                                            class="h-6 w-6 rounded-full bg-[var(--surface-3)] grid place-items-center text-xs">
                                            {{ u.nombre.charAt(0).toUpperCase() }}
                                        </div>
                                        <span class="text-sm">{{ u.nombre }}</span>
                                    </div>
                                    <div class="font-semibold">{{ currency(totalsByUser[u.id] ?? 0) }}</div>
                                </div>
                            </div>

                            <Divider class="my-3" />

                            <div class="flex gap-2">
                                <Button label="Copiar link del grupo" icon="pi pi-link" class="w-full"
                                    @click="copyLink" />
                                <Button label="Compartir" icon="pi pi-share-alt" severity="secondary" class="w-full"
                                    @click="shareLink" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Dialog: Boleta -->
            <Dialog v-model:visible="showReceipt" modal header="Boleta" :style="{ width: 'min(92vw, 720px)' }">
                <div class="w-full">
                    <img v-if="receipt?.imageUrl" :src="receipt.imageUrl" alt="Boleta"
                        class="w-full h-auto rounded-xl border border-[var(--border)]" />
                    <div v-else class="text-sm text-[var(--text-muted)]">Sin imagen (demo)</div>
                </div>
            </Dialog>
        </AppCard>
    </div>
</template>

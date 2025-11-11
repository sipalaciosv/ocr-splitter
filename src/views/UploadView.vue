<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth'
import { createGroup } from '@/services/db'

import AppCard from '@/components/AppCard.vue'
// PrimeVue...
import FileUpload from 'primevue/fileupload'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Skeleton from 'primevue/skeleton'
import InputNumber from 'primevue/inputnumber'

import { ocrMock, type OcrItem } from '@/services/mocks'

// ===== state
const toast = useToast()
const router = useRouter()
const auth = useAuthStore()

const uploading = ref(false)
const fileName = ref<string | null>(null)
const grupoId = ref<string | null>(null)
const rows = ref<OcrItem[]>([])

// ===== computed
const hasResult = computed(() => rows.value.length > 0)
const totalCLP = computed(() =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })
    .format(rows.value.reduce((a, r) => a + (Number(r.monto) || 0), 0))
)

// ===== handlers
async function onCustomUpload(evt: any) {
  const file = evt.files?.[0]
  if (!file) return
  try {
    uploading.value = true
    fileName.value = file.name

    // simulamos OCR
    const res = await ocrMock(file.name)
    grupoId.value = res.grupoId // por ahora viene 'grp_demo' del mock
    rows.value = res.items

    toast.add({ severity: 'success', summary: 'OCR simulado', detail: `Grupo ${res.grupoId}`, life: 2500 })
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo procesar la imagen.', life: 2500 })
  } finally {
    uploading.value = false
  }
}

function clearAll() {
  fileName.value = null
  grupoId.value = null
  rows.value = []
}

function removeRow(id: string) {
  rows.value = rows.value.filter((r: OcrItem) => r.id !== id)
}

// 👇 NUEVO: continuar → crea grupo (si no existe) y navega
async function onContinue() {
  if (!hasResult.value || !grupoId.value) return

  // si no hay sesión, manda a login con redirect
  if (!auth.user) {
    return router.push({ name: 'login', query: { redirect: `/grupo/${grupoId.value}` } })
  }

  try {
    // Crea el grupo y tu membresía admin (id = grupoId del mock por ahora)
    await createGroup(
      grupoId.value,
      fileName.value ? `Grupo · ${fileName.value}` : 'Grupo · OCR',
      auth.user.uid
    )
  } catch (e) {
    // si ya existía, no pasa nada (setDoc sobrescribe); lo dejamos silencioso
  }

  // navega al grupo (el guard te dejará pasar porque ya eres miembro admin)
  router.push({ name: 'grupo', params: { id: grupoId.value } })
}
</script>


<template>
  <div class="max-w-4xl mx-auto">
    <AppCard title="Cargar boleta" subtitle="Paso 1 · Subir imagen">
      <!-- Uploader -->
      <div class="space-y-4">
        <FileUpload mode="advanced" name="files[]" accept="image/*,application/pdf" :maxFileSize="8_000_000"
          :multiple="false" chooseLabel="Seleccionar" uploadLabel="Procesar OCR" cancelLabel="Limpiar"
          :customUpload="true" @uploader="onCustomUpload" @clear="clearAll" :pt="{
            root: { class: 'w-full' },
            content: { class: 'bg-transparent border border-[var(--border)] rounded-xl' }
          }" />

        <!-- Estado de carga -->
        <div v-if="uploading" class="grid grid-cols-1 gap-3">
          <Skeleton height="12rem" class="rounded-xl" />
          <Skeleton height="2.75rem" class="rounded-xl" />
        </div>

        <!-- Resultados -->
        <div v-else-if="hasResult" class="space-y-3">
          <div class="flex items-center justify-between">
            <div class="text-sm text-[var(--text-muted)]">
              Grupo: <span class="font-medium text-[var(--text-0)]">{{ grupoId }}</span>
              <span v-if="fileName"> · Archivo: {{ fileName }}</span>
            </div>
            <div class="flex items-center gap-2">
              <Tag severity="success" :value="totalCLP" />
              <Button label="Limpiar" icon="pi pi-times" text @click="clearAll" />
            </div>
          </div>

          <DataTable :value="rows" dataKey="id" class="rounded-xl overflow-hidden border border-[var(--border)]"
            :pt="{ table: { class: 'min-w-full' } }">
            <Column field="descripcion" header="Descripción" />
            <Column header="Monto">
              <template #body="{ data }">
                <InputNumber v-model="data.monto" inputId="monto" mode="currency" currency="CLP" locale="es-CL" :min="0"
                  class="w-40" />
              </template>
            </Column>
            <Column field="categoria" header="Categoría">
              <template #body="{ data }">
                <Tag :value="data.categoria ?? '—'" />
              </template>
            </Column>
            <Column header="Acciones" bodyClass="text-right">
              <template #body="{ data }">
                <Button icon="pi pi-trash" text severity="danger" @click="removeRow(data.id)" />
              </template>
            </Column>
          </DataTable>
        </div>

        <!-- Placeholder inicial -->
        <div v-else class="text-sm text-[var(--text-muted)]">
          Aquí irá el componente de subida y las validaciones.
        </div>
      </div>

      <!-- Footer -->
      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <Button label="Continuar" icon="pi pi-arrow-right" :disabled="!hasResult" @click="onContinue" />
        </div>
      </template>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { v4 as uuidv4 } from 'uuid'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth'
import { createGroup as createGroupAPI } from '@/services/api'


import AppCard from '@/components/AppCard.vue'
import FileUpload from 'primevue/fileupload'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Skeleton from 'primevue/skeleton'
import InputNumber from 'primevue/inputnumber'
import Checkbox from 'primevue/checkbox'

import { ocrMock, type OcrItem } from '@/services/mocks'

const toast = useToast()
const router = useRouter()
const auth = useAuthStore()

const uploading = ref(false)
const fileName = ref<string | null>(null)
const grupoId = ref<string | null>(null)
const rows = ref<OcrItem[]>([])
const hasSuggestedTip = ref(false)  // Si la boleta tiene propina sugerida
const includeTip = ref(false)        // Si el usuario quiere incluir la propina

const hasResult = computed(() => rows.value.length > 0)
const subtotal = computed(() => rows.value.reduce((a, r) => a + ((Number(r.monto) || 0) * (r.qty || 1)), 0))
const tipAmount = computed(() => includeTip.value ? Math.round(subtotal.value * 0.10) : 0)
const totalCLP = computed(() =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })
    .format(subtotal.value + tipAmount.value)
)

async function onCustomUpload(evt: any) {
  const file = evt.files?.[0]
  if (!file) return
  try {
    uploading.value = true
    fileName.value = file.name

    // Pasar el objeto File completo al backend OCR
    const res = await ocrMock(file)

    // Generar grupoId único si el backend no lo proporciona
    grupoId.value = res.grupoId || uuidv4()
    rows.value = res.items

    // Detectar si la boleta tiene propina sugerida
    hasSuggestedTip.value = res.hasSuggestedTip || false
    if (hasSuggestedTip.value) {
      includeTip.value = true  // Por defecto activada si viene en la boleta
    }

    toast.add({ severity: 'success', summary: 'OCR procesado', detail: `${res.items.length} items detectados`, life: 2500 })
  } catch (error) {
    console.error('Error en OCR:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo procesar la imagen.', life: 2500 })
  } finally {
    uploading.value = false
  }
}

function clearAll() {
  fileName.value = null
  grupoId.value = null
  rows.value = []
  hasSuggestedTip.value = false
  includeTip.value = false
}

function removeRow(id: string) {
  rows.value = rows.value.filter((r: OcrItem) => r.id !== id)
}

async function onContinue() {
  if (!hasResult.value || !grupoId.value) return

  if (!auth.user) {
    return router.push({ name: 'login', query: { redirect: `/grupo/${grupoId.value}` } })
  }

  try {
    // Mapear items del OCR al formato de la API
    const apiItems = rows.value.map(item => ({
      id: item.id,
      name: item.descripcion,
      price: item.monto,
      qty: item.qty || 1,
    }))

    console.log('📦 Items que se enviarán al backend:', apiItems.map(i => ({
      name: i.name,
      price: i.price,
      qty: i.qty
    })))

    // Llamar a la API del backend en lugar de Firestore directo
    const response = await createGroupAPI({
      title: fileName.value ? `Grupo · ${fileName.value}` : 'Grupo · OCR',
      items: apiItems,
      includeTip: includeTip.value,
      tipPercentage: includeTip.value ? 10 : undefined,
    })

    if (!response.success || !response.groupId) {
      throw new Error(response.error || 'No se pudo crear el grupo')
    }

    // Usar el groupId devuelto por el backend
    grupoId.value = response.groupId

    console.log('✅ Grupo creado exitosamente:', response.groupId)

    // Dar tiempo a Firestore para sincronizar antes de navegar
    await new Promise(resolve => setTimeout(resolve, 300))

  } catch (e) {

    console.error('Error al crear el grupo:', e)
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el grupo', life: 3000 })
    return
  }


  router.push({ name: 'grupo', params: { id: grupoId.value } })
}
</script>


<template>
  <div class="max-w-4xl mx-auto">
    <AppCard title="Cargar boleta" subtitle="Paso 1 · Subir imagen">

      <div class="space-y-4">
        <FileUpload mode="advanced" name="files[]" accept="image/*,application/pdf" :maxFileSize="8_000_000"
          :multiple="false" chooseLabel="Seleccionar" uploadLabel="Procesar OCR" cancelLabel="Limpiar"
          :customUpload="true" @uploader="onCustomUpload" @clear="clearAll" :pt="{
            root: { class: 'w-full' },
            content: { class: 'bg-transparent border border-[var(--border)] rounded-xl' }
          }" />


        <div v-if="uploading" class="grid grid-cols-1 gap-3">
          <Skeleton height="12rem" class="rounded-xl" />
          <Skeleton height="2.75rem" class="rounded-xl" />
        </div>


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
            <Column field="qty" header="Cant." style="width: 80px">
              <template #body="{ data }">
                <InputNumber v-model="data.qty" :min="1" :max="99" showButtons buttonLayout="horizontal" class="w-20"
                  incrementButtonIcon="pi pi-plus" decrementButtonIcon="pi pi-minus" />
              </template>
            </Column>
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

          <!-- Sección de Propina -->
          <div v-if="hasSuggestedTip"
            class="mt-4 p-4 bg-[var(--surface-50)] dark:bg-[var(--surface-800)] rounded-lg border border-[var(--border)]">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <Checkbox v-model="includeTip" inputId="includeTip" binary />
                <label for="includeTip" class="text-sm font-medium cursor-pointer">
                  Incluir propina sugerida (10%)
                </label>
              </div>
              <Tag v-if="includeTip"
                :value="`+${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(tipAmount)}`"
                severity="info" />
            </div>

            <div class="space-y-1 text-sm">
              <div class="flex justify-between text-[var(--text-muted)]">
                <span>Subtotal:</span>
                <span>{{ new Intl.NumberFormat('es-CL', {
                  style: 'currency', currency: 'CLP', maximumFractionDigits: 0
                }).format(subtotal) }}</span>
              </div>
              <div v-if="includeTip" class="flex justify-between text-[var(--text-muted)]">
                <span>Propina (10%):</span>
                <span>{{ new Intl.NumberFormat('es-CL', {
                  style: 'currency', currency: 'CLP', maximumFractionDigits: 0
                }).format(tipAmount) }}</span>
              </div>
              <div class="flex justify-between font-bold text-[var(--text-0)] pt-2 border-t border-[var(--border)]">
                <span>Total:</span>
                <span>{{ totalCLP }}</span>
              </div>
            </div>
          </div>
        </div>


        <div v-else class="text-sm text-[var(--text-muted)]">

        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <Button label="Continuar" icon="pi pi-arrow-right" :disabled="!hasResult" @click="onContinue" />
        </div>
      </template>
    </AppCard>
  </div>
</template>

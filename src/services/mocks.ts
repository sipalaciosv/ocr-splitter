// src/services/mocks.ts
// === Tipos ===
export type MockUser = {
  id: string
  nombre: string
}

export type MockReceiptItem = {
  id: string
  name: string
  price: number
  qty: number
  assignedUserIds?: string[] // multi-asignación para dividir

}

export type MockReceipt = {
  id: string
  titulo: string
  items: MockReceiptItem[]
    imageUrl?: string 
}

export type MockGroup = {
  id: string
  nombre: string
  ownerId?: string        // si prefieres mantener compatibilidad
  ownerUid?: string       // <- usa este en el front
  miembros: string[]
  receiptId: string
}

// === Datos base ===
const USERS: MockUser[] = [
  { id: 'u1', nombre: 'Seba' },
  { id: 'u2', nombre: 'Pablo' },
  { id: 'u3', nombre: 'Vale' },
  { id: 'u4', nombre: 'Kata' },
]

const RECEIPTS: MockReceipt[] = [
  {
    id: 'r_demo',
    titulo: 'Pub Viernes · 2025-11-01',
    imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=1200',
    items: [
      { id: 'i1', name: 'Papas fritas', price: 6000, qty: 1, assignedUserIds: ['u1', 'u2'] },
      { id: 'i2', name: 'Cerveza',      price: 3000, qty: 2, assignedUserIds: ['u3'] },
      { id: 'i3', name: 'Pizza',        price: 12000, qty: 1, assignedUserIds: ['u1'] },
      { id: 'i4', name: 'Bebida',       price: 2500, qty: 3, assignedUserIds: [] },
    ]
  }
]

const GROUPS: MockGroup[] = [
  {
    id: 'grp_demo',
    nombre: 'Viernes en el Pub',
    ownerUid: 'u1',            // <-- dueño explícito
    miembros: ['u1', 'u2', 'u3'],
    receiptId: 'r_demo'
  }
]

// === Helpers simulando “API” ===
const delay = (ms = 350) => new Promise(res => setTimeout(res, ms))

export async function mockGetGroupById(id: string): Promise<MockGroup | null> {
  await delay()
  return GROUPS.find(g => g.id === id) ?? null
}

export async function mockGetReceiptById(id: string): Promise<MockReceipt> {
  await delay()
  const r = RECEIPTS.find(r => r.id === id)
  if (!r) throw new Error('Receipt no encontrado')
  // devolver copia inmutable
  return JSON.parse(JSON.stringify(r))
}

export async function mockListUsersByIds(ids: string[]): Promise<MockUser[]> {
  await delay(120)
  return USERS.filter(u => ids.includes(u.id))
}

// (Opcional) crear grupo nuevo a partir de una boleta escaneada
export async function mockCreateGroupFromReceipt(params: { nombre: string; miembroIds: string[]; receipt: MockReceipt }): Promise<MockGroup> {
  await delay()
  const rid = `r_${Math.random().toString(36).slice(2, 7)}`
  const gid = `grp_${Math.random().toString(36).slice(2, 7)}`
  RECEIPTS.push({ ...params.receipt, id: rid })
  const g: MockGroup = { id: gid, nombre: params.nombre, miembros: params.miembroIds, receiptId: rid }
  GROUPS.push(g)
  return g
}
// === Tipos OCR (para UploadView) ===
export type OcrItem = {
  id: string
  descripcion: string
  monto: number
  categoria?: string | null
}

// === Mock OCR principal ===
export async function ocrMock(fileName: string): Promise<{ grupoId: string; items: OcrItem[] }> {
  // Simula latencia
  await new Promise((r) => setTimeout(r, 400))

  // Genera un grupo "nuevo" de mentira (puedes cambiarlo por grp_demo si quieres)
  const grupoId = 'grp_demo'

  // Items ejemplo (puedes mutar estos datos a gusto)
  const items: OcrItem[] = [
    { id: 'o1', descripcion: 'Papas fritas', monto: 6000, categoria: 'Comida' },
    { id: 'o2', descripcion: 'Cerveza', monto: 3000, categoria: 'Bebida' },
    { id: 'o3', descripcion: 'Pizza', monto: 12000, categoria: 'Comida' },
    { id: 'o4', descripcion: 'Bebida', monto: 2500, categoria: 'Bebida' },
  ]

  return { grupoId, items }
}

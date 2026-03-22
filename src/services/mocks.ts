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
  assignedUserIds?: string[]

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
  ownerId?: string
  ownerUid?: string
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
      { id: 'i1', name: 'Papas fritas', price: 6000, qty: 1 },
      { id: 'i2', name: 'Cerveza', price: 3000, qty: 2 },
      { id: 'i3', name: 'Pizza', price: 12000, qty: 1 },
      { id: 'i4', name: 'Bebida', price: 2500, qty: 3 },
    ]
  }
]

const GROUPS: MockGroup[] = [
  {
    id: 'grp_demo',
    nombre: 'Viernes en el Pub',
    ownerUid: 'u1',
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
  return JSON.parse(JSON.stringify(r))
}

export async function mockListUsersByIds(ids: string[]): Promise<MockUser[]> {
  await delay(120)
  return USERS.filter(u => ids.includes(u.id))
}


export async function mockCreateGroupFromReceipt(params: { nombre: string; miembroIds: string[]; receipt: MockReceipt }): Promise<MockGroup> {
  await delay()
  const rid = `r_${Math.random().toString(36).slice(2, 7)}`
  const gid = `grp_${Math.random().toString(36).slice(2, 7)}`
  RECEIPTS.push({ ...params.receipt, id: rid })
  const g: MockGroup = { id: gid, nombre: params.nombre, miembros: params.miembroIds, receiptId: rid }
  GROUPS.push(g)
  return g
}
// === Tipos OCR ===
export type OcrItem = {
  id: string
  descripcion: string
  monto: number
  qty?: number  // Cantidad del backend OCR
  categoria?: string | null
}

// === Mock OCR principal ===
/**
 * Procesa una imagen de boleta usando el backend OCR
 * @param file - Archivo de imagen a procesar
 * @returns Objeto con grupoId vacío, items extraídos y flag de propina sugerida
 */
export async function ocrMock(file: File): Promise<{ grupoId: string; items: OcrItem[]; hasSuggestedTip?: boolean }> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('http://localhost:3000/api/ocr/process', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al procesar OCR');
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Error desconocido al procesar OCR');
    }

    // Adaptar formato del backend al formato esperado por el frontend
    const items: OcrItem[] = data.items.map((item: any) => ({
      id: item.id,
      descripcion: item.name,
      monto: item.price,
      qty: item.qty || 1,  // Cantidad del backend
      categoria: null, // El backend no devuelve categoría por ahora
    }));

    return {
      grupoId: '', // Se generará al crear el grupo
      items,
      hasSuggestedTip: data.hasSuggestedTip || false,
    };
  } catch (error) {
    console.error('Error en ocrMock:', error);
    throw error;
  }
}


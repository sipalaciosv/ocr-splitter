export type OcrItem = {
  id: string
  descripcion: string
  monto: number
  categoria?: string
}

export function ocrMock(fileName = 'boleta.jpg'): Promise<{ grupoId: string; items: OcrItem[] }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        grupoId: 'grp_' + Math.random().toString(36).slice(2, 8),
        items: [
          { id: '1', descripcion: 'Café Latte', monto: 3200, categoria: 'Bebidas' },
          { id: '2', descripcion: 'Sandwich Ave', monto: 5200, categoria: 'Comida' },
          { id: '3', descripcion: 'IVA 19%',  monto: 1600 },
        ],
      })
    }, 600) // pequeño delay para ver Skeletons
  })
}

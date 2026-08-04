export interface Inventario {
  repuesto_id: number
  admin_id: number
  nombre: string
  stock: number
  precio_unidad: number
}

export interface InventarioFormData {
  admin_id: number
  nombre: string
  stock: number
  precio_unidad: number
}

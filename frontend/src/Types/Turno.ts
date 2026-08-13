export const ESTADOS_TECNICOS = ["En espera", "Reparando", "En espera de stock", "Reparado", "Sin solución"] as const

export const ESTADOS_COMERCIALES = ["Pagado", "No pagado"] as const

export type EstadoTecnico = (typeof ESTADOS_TECNICOS)[number]

export type EstadoComercial = (typeof ESTADOS_COMERCIALES)[number]

export interface TurnoServicio {
  servicio_id: number
  nombre: string
  precio_historico: number
}

export interface Turno {
  turno_id: number
  cliente_id: number
  titulo: string
  descripcion: string
  fecha_entrada: string
  fecha_salida: string
  extras: string
  estado_comercial: EstadoComercial
  estado_tecnico: EstadoTecnico
  cancelado: boolean
  cliente_nombre: string
  cliente_apellido: string
  telefono: string
  servicios: TurnoServicio[]
  total: number
}

export interface TurnoFormData {
  cliente_id: number
  titulo: string
  descripcion: string
  estado_comercial: EstadoComercial
  estado_tecnico: EstadoTecnico
  servicios: number[]
  extras: string
}

export type TurnosKanban = Record<EstadoTecnico, Turno[]>

export const formatearFecha = (fecha: string): string => {
  const date = new Date(fecha)
  if (isNaN(date.getTime())) return fecha
  const dia = String(date.getDate()).padStart(2, "0")
  const mes = String(date.getMonth() + 1).padStart(2, "0")
  const anio = date.getFullYear()
  return `${dia} - ${mes} - ${anio}`
}

export const formatearTotal = (total: number): string =>
  `$${total.toLocaleString("es-AR")}`

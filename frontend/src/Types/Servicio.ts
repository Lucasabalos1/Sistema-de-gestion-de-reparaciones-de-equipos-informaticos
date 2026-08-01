export interface Servicio {
  servicio_id: number
  nombre: string
  precio: number
  estado: boolean
}

export interface ServicioFormData {
  nombre: string
  precio: number
  estado: boolean
}

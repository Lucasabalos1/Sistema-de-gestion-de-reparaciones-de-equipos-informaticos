export interface Cliente {
  cliente_id: number
  admin_id: number
  nombre: string
  apellido: string
  telefono: string
  correo: string
  genero: string
}

export interface ClienteFormData {
  nombre: string
  apellido: string
  telefono: string
  correo: string
  genero: string
}

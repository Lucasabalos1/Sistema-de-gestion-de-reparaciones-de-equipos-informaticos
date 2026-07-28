export interface Notification {
  consulta_id: number
  chat_id_telegram: number
  nombre_telegram: string
  telefono: string
  fecha_recepcion: string
  resumen_ia: string
  mensaje_original: string
  leido: boolean
}

export interface NotificationResponse {
  leidas: Notification[]
  no_leidas: Notification[]
}

export interface NotificationPutResponse {
  mensaje: string
}

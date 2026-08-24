export interface ServicioTop {
  nombre: string
  cantidad: number
}

export interface CompletadosCancelados {
  completados_pct: number
  cancelados_pct: number
}

export interface TendenciaReparados {
  mes: number
  cantidad: number
}

export interface TendenciaIngresos {
  mes: number
  ingreso: number
}

export interface DistribucionEstadoTecnico {
  estado: string
  cantidad: number
}

export interface NotificacionesGlobal {
  recibidas: number
  leidas: number
  no_leidas: number
}

export interface MetricasMensual {
  periodo: { mes: number; anio: number }
  turnos_recibidos: number
  equipos_reparados: number
  turnos_cancelados: number
  completados_vs_cancelados: CompletadosCancelados
  dinero_ganado: number
  monto_pendiente: number
  ticket_promedio: number
  tiempo_promedio_reparacion: number
  servicios_mas_usados: ServicioTop[]
  notificaciones_recibidas: number
}

export interface MetricasGlobal {
  periodo: { anio: number }
  turnos_recibidos: number
  equipos_reparados: number
  turnos_cancelados: number
  completados_vs_cancelados: CompletadosCancelados
  dinero_ganado: number
  monto_pendiente: number
  ticket_promedio: number
  tiempo_promedio_reparacion: number
  servicios_mas_usados: ServicioTop[]
  notificaciones: NotificacionesGlobal
  tendencia_reparados: TendenciaReparados[]
  tendencia_ingresos: TendenciaIngresos[]
  distribucion_estado_tecnico: DistribucionEstadoTecnico[]
}

export interface MetricasMensualPayload {
  mes: number
  anio: number
}

export interface MetricasGlobalPayload {
  anio?: number
}

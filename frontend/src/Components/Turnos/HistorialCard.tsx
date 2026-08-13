import { CalendarDays } from "lucide-react"
import { formatearFecha, formatearTotal } from "../../Types/Turno"
import type { Turno } from "../../Types/Turno"

interface HistorialCardProps {
  turno: Turno
}

export const HistorialCard = ({ turno }: HistorialCardProps) => {
  const estadoTecnicoClass =
    turno.estado_tecnico === "Reparado"
      ? "bg-success/20 text-success"
      : turno.estado_tecnico === "Sin solución"
        ? "bg-danger/20 text-danger"
        : "bg-warning/20 text-warning"

  const estadoComercialClass =
    turno.estado_comercial === "Pagado"
      ? "bg-success/20 text-success"
      : "bg-warning/20 text-warning"

  return (
    <div className={`rounded-lg p-5 border-2 bg-surface flex flex-col gap-3 ${turno.cancelado ? "border-danger/40 opacity-70" : "border-muted"}`}>
      <div className="flex items-center gap-2">
        <CalendarDays size={18} className={`shrink-0 ${turno.cancelado ? "text-danger/60" : "text-accent"}`} />
        <p className="text-text-muted text-sm">{formatearFecha(turno.fecha_entrada)}</p>
      </div>

      <div>
        <p className={`font-bold text-lg ${turno.cancelado ? "text-danger/70 line-through decoration-danger/40" : "text-primary"}`}>{turno.titulo}</p>
        <p className="text-text-muted text-sm mt-1">
          {turno.descripcion}
        </p>
      </div>

      <div className="border-t border-muted" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-text-muted text-xs font-semibold uppercase tracking-wide mb-1">
            Cliente
          </p>
          <p className="text-text text-sm font-medium warp-break-words">
            {turno.cliente_nombre} {turno.cliente_apellido}
          </p>
          <p className="text-text-muted text-xs mt-0.5 warp-break-words">{turno.telefono}</p>
        </div>
        <div>
          <p className="text-text-muted text-xs font-semibold uppercase tracking-wide mb-1">
            Servicios
          </p>
          <ul className="list-disc list-inside space-y-0.5">
            {turno.servicios.map((servicio) => (
              <li key={servicio.servicio_id} className="text-text text-sm warp-break-words">
                {servicio.nombre}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-row items-center justify-between gap-2 pt-3 border-t border-muted">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoTecnicoClass}`}>
            {turno.estado_tecnico}
          </span>
          {turno.cancelado ? (
            <span className="px-2 py-0.5 rounded-full bg-danger/20 text-danger text-xs font-medium">
              Cancelado
            </span>
          ) : (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoComercialClass}`}>
              {turno.estado_comercial}
            </span>
          )}
        </div>
        <p className="text-text font-bold text-sm">
          TOTAL: {formatearTotal(turno.total)}
        </p>
      </div>
    </div>
  )
}

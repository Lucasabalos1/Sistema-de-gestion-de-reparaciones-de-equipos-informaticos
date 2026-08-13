import { useState, useEffect } from "react"
import { X, Pencil, CalendarDays, User, Ban } from "lucide-react"
import { formatearFecha, formatearTotal } from "../../Types/Turno"
import type { Turno, EstadoComercial } from "../../Types/Turno"

interface TurnoDataProps {
  isOpen: boolean
  turno: Turno | null
  onClose: () => void
  onEdit: () => void
  onCancelar: () => void
  onCambiarEstadoComercial: (id: number, estadoComercial: EstadoComercial) => Promise<{ message: string } | null>
}

export const TurnoData = ({ isOpen, turno, onClose, onEdit, onCancelar, onCambiarEstadoComercial }: TurnoDataProps) => {
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [isClosing, setIsClosing] = useState<boolean>(false)
  const [comercialActual, setComercialActual] = useState<EstadoComercial | null>(null)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setIsClosing(false)
      if (turno) {
        setComercialActual(turno.estado_comercial)
      }
    }
  }, [isOpen, turno])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsVisible(false)
      setIsClosing(false)
      onClose()
    }, 200)
  }

  if (!isVisible || !turno) return null

  const estadoTecnicoClass =
    turno.estado_tecnico === "Reparado"
      ? "bg-success/20 text-success"
      : turno.estado_tecnico === "Sin solución"
        ? "bg-danger/20 text-danger"
        : "bg-warning/20 text-warning"

  const estadoComercial = comercialActual ?? turno.estado_comercial

  const handleToggleComercial = async (nuevoEstado: EstadoComercial) => {
    if (nuevoEstado === estadoComercial) return
    const result = await onCambiarEstadoComercial(turno.turno_id, nuevoEstado)
    if (result) {
      setComercialActual(nuevoEstado)
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm ${isClosing ? "modal-hide" : "modal-show"}`}
      onClick={handleClose}
    >
      <div
        className={`bg-surface border border-muted rounded-2xl w-[90%] max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scroll ${isClosing ? "modal-content-hide" : "modal-content-show"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-text-muted hover:text-danger transition-colors duration-200 cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Encabezado con título y badges */}
        <div className="pr-6 mb-5">
          <p className="text-primary text-xl font-bold">{turno.titulo}</p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoTecnicoClass}`}>
              {turno.estado_tecnico}
            </span>
            {turno.cancelado ? (
              <span className="px-2 py-0.5 rounded-full bg-danger/20 text-danger text-xs font-medium">
                Cancelado
              </span>
            ) : (
              <div className="flex rounded-full p-0.5 bg-background border border-muted">
                <button
                  type="button"
                  onClick={() => handleToggleComercial("Pagado")}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 cursor-pointer ${
                    estadoComercial === "Pagado"
                      ? "bg-success/20 text-success"
                      : "text-text-muted hover:text-text"
                  }`}
                >
                  Pagado
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleComercial("No pagado")}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 cursor-pointer ${
                    estadoComercial === "No pagado"
                      ? "bg-warning/20 text-warning"
                      : "text-text-muted hover:text-text"
                  }`}
                >
                  No pagado
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Fechas */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="flex items-center gap-2 flex-1 rounded-lg p-3 bg-background border border-muted">
            <CalendarDays size={16} className="text-accent shrink-0" />
            <div>
              <p className="text-text-muted text-xs font-medium uppercase tracking-wider">Entrada</p>
              <p className="text-text text-sm">{formatearFecha(turno.fecha_entrada)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-1 rounded-lg p-3 bg-background border border-muted">
            <CalendarDays size={16} className="text-accent shrink-0" />
            <div>
              <p className="text-text-muted text-xs font-medium uppercase tracking-wider">Salida</p>
              <p className="text-text text-sm">
                {turno.fecha_salida && turno.fecha_salida !== "Sin datos"
                  ? formatearFecha(turno.fecha_salida)
                  : "Pendiente"}
              </p>
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div className="mb-5">
          <p className="text-text-muted text-xs font-medium uppercase tracking-wider">Descripción</p>
          <p className="text-text text-sm mt-1 break-words">{turno.descripcion}</p>
        </div>

        {/* Cliente */}
        <div className="flex items-center gap-2 rounded-lg p-3 bg-background border border-muted mb-5">
          <User size={16} className="text-accent shrink-0" />
          <div className="min-w-0">
            <p className="text-text text-sm font-medium truncate">
              {turno.cliente_nombre} {turno.cliente_apellido}
            </p>
            <p className="text-text-muted text-xs">{turno.telefono}</p>
          </div>
        </div>

        {/* Servicios */}
        <div className="mb-5">
          <p className="text-text-muted text-xs font-medium uppercase tracking-wider mb-1">
            Servicios
          </p>
          <ul className="space-y-1">
            {turno.servicios.map((servicio) => (
              <li key={servicio.servicio_id} className="flex items-center justify-between text-sm">
                <span className="text-text break-words">{servicio.nombre}</span>
                <span className="text-text-muted shrink-0 ml-2">{formatearTotal(servicio.precio_historico)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Extras */}
        {turno.extras && turno.extras !== "Sin datos" && (
          <div className="mb-5">
            <p className="text-text-muted text-xs font-medium uppercase tracking-wider">Extras</p>
            <p className="text-text text-sm mt-1 break-words">{turno.extras}</p>
          </div>
        )}

        {/* Total */}
        <div className="flex items-center justify-between pt-3 border-t border-muted mb-6">
          <p className="text-text-muted text-sm">Total</p>
          <p className="text-text font-bold">{formatearTotal(turno.total)}</p>
        </div>

        {/* Botones Editar / Cancelar */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onEdit}
            disabled={turno.cancelado}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/80 transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Pencil size={16} />
            Editar
          </button>
          <button
            type="button"
            onClick={onCancelar}
            disabled={turno.cancelado}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-danger/10 text-danger text-sm font-medium hover:bg-danger/20 transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Ban size={16} />
            Cancelar turno
          </button>
        </div>
      </div>
    </div>
  )
}

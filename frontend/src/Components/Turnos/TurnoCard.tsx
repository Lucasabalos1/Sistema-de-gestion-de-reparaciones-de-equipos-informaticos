import type { Turno } from "../../Types/Turno"
import type { DragEvent } from "react"

interface TurnoCardProps {
  turno: Turno
  onVerDetalle: (turno: Turno) => void
  onDragStart?: (e: DragEvent<HTMLDivElement>) => void
  onDragEnd?: () => void
}

export const TurnoCard = ({ turno, onVerDetalle, onDragStart, onDragEnd }: TurnoCardProps) => {
  const cardClass = turno.cancelado
    ? "border-danger/60 opacity-60"
    : "border-muted"

  return (
    <div
      draggable={!turno.cancelado}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`rounded-lg p-4 border-2 bg-surface flex flex-col gap-3 cursor-grab active:cursor-grabbing select-none transition-opacity duration-200 ${cardClass}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-text font-medium text-sm truncate">
          {turno.cliente_nombre} {turno.cliente_apellido}
        </p>
      </div>
      <p className="text-text-muted text-xs">
        Titulo: {turno.titulo}
      </p>
      <div className="flex items-center gap-2 pt-2 border-t border-muted">
        <button
          type="button"
          onClick={() => onVerDetalle(turno)}
          disabled={turno.cancelado}
          className="flex-1 px-2 py-1.5 rounded-md bg-accent/10 text-accent text-xs font-medium hover:bg-accent/20 transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Mas informacion
        </button>
      </div>
    </div>
  )
}

import { useState } from "react"
import { TurnoCard } from "./TurnoCard"
import { TurnoData } from "./TurnoData"
import { CancelarTurnoModal } from "./CancelarTurnoModal"
import { ESTADOS_TECNICOS } from "../../Types/Turno"
import type { TurnosKanban as KanbanData, EstadoTecnico, EstadoComercial, Turno } from "../../Types/Turno"
import type { DragEvent } from "react"

interface MessageResponse {
  message: string
}

interface TurnosKanbanProps {
  kanban: KanbanData
  onCambiarEstadoTecnico: (id: number, estadoTecnico: EstadoTecnico) => Promise<MessageResponse | null>
  onCambiarEstadoComercial: (id: number, estadoComercial: EstadoComercial) => Promise<MessageResponse | null>
  onCancelarTurno: (id: number) => Promise<MessageResponse | null>
  onEditar: (turno: Turno) => void
}

export const TurnosKanban = ({ kanban, onCambiarEstadoTecnico, onCambiarEstadoComercial, onCancelarTurno, onEditar }: TurnosKanbanProps) => {
  const [dragOverColumn, setDragOverColumn] = useState<EstadoTecnico | null>(null)
  const [dragSourceColumn, setDragSourceColumn] = useState<EstadoTecnico | null>(null)
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<Turno | null>(null)
  const [turnoACancelar, setTurnoACancelar] = useState<Turno | null>(null)

  const handleDragStart = (e: DragEvent<HTMLDivElement>, turno: Turno, columna: EstadoTecnico) => {
    setDragSourceColumn(columna)
    e.dataTransfer.setData("text/plain", String(turno.turno_id))
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragEnd = () => {
    setDragOverColumn(null)
    setDragSourceColumn(null)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>, columna: EstadoTecnico) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverColumn(columna)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = async (e: DragEvent<HTMLDivElement>, columna: EstadoTecnico) => {
    e.preventDefault()
    const id = Number(e.dataTransfer.getData("text/plain"))
    setDragOverColumn(null)
    setDragSourceColumn(null)
    if (!id || columna === dragSourceColumn) return
    await onCambiarEstadoTecnico(id, columna)
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-primary mb-4">
        Tablero de turnos
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {ESTADOS_TECNICOS.map((columna) => {
          const turnos = kanban[columna]
          return (
            <div
              key={columna}
              onDragOver={(e) => handleDragOver(e, columna)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, columna)}
              className={`flex flex-col rounded-lg p-2 border-2 min-h-40 max-h-96 overflow-hidden transition-colors duration-200 ${
                dragOverColumn === columna
                  ? "border-accent bg-secondary/70"
                  : "border-muted bg-secondary/40"
              }`}
            >
              <div className="flex items-center justify-between mb-3 shrink-0">
                <p className="text-text text-sm font-semibold">
                  {columna}
                </p>
                <span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center">
                  {turnos.length}
                </span>
              </div>
              <div className="space-y-3 overflow-y-auto pr-1 custom-scroll">
                {turnos.map((turno) => (
                  <TurnoCard
                    key={turno.turno_id}
                    turno={turno}
                    onVerDetalle={setTurnoSeleccionado}
                    onDragStart={(e) => handleDragStart(e, turno, columna)}
                    onDragEnd={handleDragEnd}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <TurnoData
        isOpen={!!turnoSeleccionado}
        turno={turnoSeleccionado}
        onClose={() => setTurnoSeleccionado(null)}
        onEdit={() => {
          if (turnoSeleccionado) onEditar(turnoSeleccionado)
          setTurnoSeleccionado(null)
        }}
        onCancelar={() => {
          setTurnoACancelar(turnoSeleccionado)
          setTurnoSeleccionado(null)
        }}
        onCambiarEstadoComercial={onCambiarEstadoComercial}
      />

      <CancelarTurnoModal
        isOpen={!!turnoACancelar}
        turno={turnoACancelar}
        onClose={() => setTurnoACancelar(null)}
        onConfirm={async (id) => {
          const result = await onCancelarTurno(id)
          setTurnoACancelar(null)
          return result
        }}
      />
    </div>
  )
}

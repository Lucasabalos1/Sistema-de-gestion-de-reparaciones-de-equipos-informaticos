import { HistorialCard } from "./HistorialCard"
import type { Turno } from "../../Types/Turno"

interface HistorialTurnosProps {
  historial: Turno[]
}

export const HistorialTurnos = ({ historial }: HistorialTurnosProps) => {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-4">
        <h2 className="text-xl font-bold text-primary">
          Historial de reparaciones
        </h2>
        <p className="text-text-muted text-sm">
          Turnos registrados: {historial.length}
        </p>
      </div>

      {historial.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-text-muted text-sm">No hay turnos en el historial</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {historial.map((turno) => (
            <HistorialCard key={turno.turno_id} turno={turno} />
          ))}
        </div>
      )}
    </div>
  )
}

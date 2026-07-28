import { CheckCheck } from "lucide-react"
import type { Notification } from "../../Types/notificacion"

interface NotificationCardProps {
  notification: Notification
  onMarkAsRead: (id: number) => void
}

export const NotificationCard = ({ notification, onMarkAsRead }: NotificationCardProps) => {
  const { consulta_id, nombre_telegram, telefono, fecha_recepcion, mensaje_original, resumen_ia, leido } = notification
  const initial = nombre_telegram.charAt(0).toUpperCase()

  return (
    <div
      className={`rounded-lg p-4 border-2 bg-surface transition-colors duration-200 ${
        leido ? "border-muted" : "border-success"
      }`}
    >
      {/* Header: Avatar + nombre + teléfono + botón check */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
            <span className="text-accent font-bold text-sm">{initial}</span>
          </div>

          {/* Nombre y teléfono */}
          <div className="min-w-0">
            <p className="text-text font-medium text-sm truncate">{nombre_telegram}</p>
            <p className="text-text-muted text-xs">{telefono}</p>
          </div>
        </div>

        {/* Botón marcar como leído (solo si no leído) */}
        {!leido && (
          <button
            type="button"
            onClick={() => onMarkAsRead(consulta_id)}
            className="text-accent hover:text-primary transition-colors duration-200 cursor-pointer shrink-0"
            title="Marcar como leído"
          >
            <CheckCheck size={20} />
          </button>
        )}
      </div>

      {/* Fecha */}
      <p className="text-text-muted text-xs mt-3">
        Último mensaje: {fecha_recepcion}
      </p>

      {/* Mensaje original */}
      <p className="text-text text-sm mt-2 leading-relaxed">
        {mensaje_original}
      </p>

      {/* Resumen IA */}
      <div className="mt-3 pt-3 border-t border-muted">
        <p className="text-primary text-xs font-medium mb-1">Resumen IA</p>
        <p className="text-text-muted text-sm leading-relaxed">{resumen_ia}</p>
      </div>
    </div>
  )
}

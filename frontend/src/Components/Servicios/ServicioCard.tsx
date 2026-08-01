import { Pencil } from "lucide-react"
import type { Servicio } from "../../Types/Servicio"

interface ServicioCardProps {
  servicio: Servicio
  onEdit: () => void
}

export const ServicioCard = ({ servicio, onEdit }: ServicioCardProps) => {
  const formatearPrecio = (precio: number): string =>
    `$${precio.toLocaleString("es-AR")}`

  return (
    <div className="flex flex-col rounded-lg p-4 border-2 border-muted bg-surface hover:border-accent transition-colors duration-200">
      <div className="flex items-center justify-between gap-2">
        <p className="text-text font-medium text-sm truncate">
          {servicio.nombre}
        </p>
        <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium ${servicio.estado ? "bg-success/15 text-success" : "bg-danger/15 text-danger"}`}>
          {servicio.estado ? "Activo" : "Inactivo"}
        </span>
      </div>

      <p className="text-primary text-2xl font-bold text-center my-4">
        {formatearPrecio(servicio.precio)}
      </p>

      <button
        type="button"
        onClick={onEdit}
        className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/80 transition-colors duration-200 cursor-pointer mt-auto"
      >
        <Pencil size={16} />
        Editar
      </button>
    </div>
  )
}

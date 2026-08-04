import { Pencil } from "lucide-react"
import type { Inventario } from "../../Types/Inventory"

interface InventarioTableProps {
  items: Inventario[]
  onEdit: (item: Inventario) => void
}

const formatearPrecio = (precio: number): string =>
  `$${precio.toLocaleString("es-AR")}`

export const InventarioTable = ({ items, onEdit }: InventarioTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse">
        <thead>
          <tr className="border-b-2 border-muted">
            <th className="text-left text-text-muted text-xs font-semibold uppercase tracking-wider px-4 py-3">
              Nombre
            </th>
            <th className="text-left text-text-muted text-xs font-semibold uppercase tracking-wider px-4 py-3">
              Cantidad
            </th>
            <th className="text-left text-text-muted text-xs font-semibold uppercase tracking-wider px-4 py-3">
              Precio
            </th>
            <th className="text-right text-text-muted text-xs font-semibold uppercase tracking-wider px-4 py-3">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.repuesto_id} className="border-b border-muted hover:bg-secondary/20 transition-colors duration-150">
              <td className="px-4 py-3 text-text text-sm font-medium truncate max-w-[220px]">
                {item.nombre}
              </td>
              <td className="px-4 py-3 text-text text-sm">
                {item.stock}
              </td>
              <td className="px-4 py-3 text-primary text-sm font-semibold">
                {formatearPrecio(item.precio_unidad)}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => onEdit(item)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent/80 transition-colors duration-200 cursor-pointer"
                >
                  <Pencil size={14} />
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

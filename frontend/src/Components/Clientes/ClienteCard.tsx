import type { Cliente } from "../../Types/Cliente"

interface ClienteCardProps {
  cliente: Cliente
  onClick: () => void
}

export const ClienteCard = ({ cliente, onClick }: ClienteCardProps) => {
  const inicial = cliente.nombre.charAt(0).toUpperCase()

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between rounded-lg p-4 border-2 border-muted bg-surface hover:border-accent transition-colors duration-200 cursor-pointer"
    >
      <div className="min-w-0">
        <p className="text-text font-medium text-sm truncate">
          {cliente.nombre} {cliente.apellido}
        </p>
        <p className="text-text-muted text-xs mt-0.5">
          {cliente.telefono}
        </p>
      </div>
      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0 ml-3">
        <span className="text-accent font-bold text-sm">{inicial}</span>
      </div>
    </div>
  )
}

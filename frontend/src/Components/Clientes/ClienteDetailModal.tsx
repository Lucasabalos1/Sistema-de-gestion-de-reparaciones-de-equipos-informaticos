import { useState, useEffect } from "react"
import { X, Pencil, Trash2 } from "lucide-react"
import type { Cliente } from "../../Types/Cliente"

interface ClienteDetailModalProps {
  isOpen: boolean
  cliente: Cliente | null
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}

export const ClienteDetailModal = ({ isOpen, cliente, onClose, onEdit, onDelete }: ClienteDetailModalProps) => {
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [isClosing, setIsClosing] = useState<boolean>(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setIsClosing(false)
    }
  }, [isOpen])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsVisible(false)
      setIsClosing(false)
      onClose()
    }, 200)
  }

  if (!isVisible || !cliente) return null

  const inicial = cliente.nombre.charAt(0).toUpperCase()

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm ${isClosing ? "modal-hide" : "modal-show"}`}
      onClick={handleClose}
    >
      <div
        className={`bg-surface border border-muted rounded-2xl w-[90%] max-w-md p-6 shadow-2xl relative ${isClosing ? "modal-content-hide" : "modal-content-show"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-text-muted hover:text-danger transition-colors duration-200 cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Avatar circular grande */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center">
            <span className="text-accent font-bold text-3xl">{inicial}</span>
          </div>
        </div>

        {/* Campos de información */}
        <div className="space-y-4">
          <div>
            <p className="text-text-muted text-xs font-medium uppercase tracking-wider">Nombre</p>
            <p className="text-text text-sm mt-0.5">{cliente.nombre}</p>
          </div>
          <div>
            <p className="text-text-muted text-xs font-medium uppercase tracking-wider">Apellido</p>
            <p className="text-text text-sm mt-0.5">{cliente.apellido || "—"}</p>
          </div>
          <div>
            <p className="text-text-muted text-xs font-medium uppercase tracking-wider">Teléfono</p>
            <p className="text-text text-sm mt-0.5">{cliente.telefono}</p>
          </div>
          <div>
            <p className="text-text-muted text-xs font-medium uppercase tracking-wider">Correo</p>
            <p className="text-text text-sm mt-0.5">{cliente.correo || "—"}</p>
          </div>
          <div>
            <p className="text-text-muted text-xs font-medium uppercase tracking-wider">Género</p>
            <p className="text-text text-sm mt-0.5">{cliente.genero || "—"}</p>
          </div>
        </div>

        {/* Botones Editar / Eliminar */}
        <div className="flex gap-3 mt-8">
          <button
            type="button"
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/80 transition-colors duration-200 cursor-pointer"
          >
            <Pencil size={16} />
            Editar
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-danger/10 text-danger text-sm font-medium hover:bg-danger/20 transition-colors duration-200 cursor-pointer"
          >
            <Trash2 size={16} />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

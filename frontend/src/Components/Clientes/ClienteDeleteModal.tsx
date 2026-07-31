import { useState, useEffect } from "react"
import { AlertTriangle } from "lucide-react"
import type { Cliente } from "../../Types/Cliente"

interface ClienteDeleteModalProps {
  isOpen: boolean
  cliente: Cliente | null
  onClose: () => void
  onConfirm: (id: number) => Promise<boolean>
}

export const ClienteDeleteModal = ({ isOpen, cliente, onClose, onConfirm }: ClienteDeleteModalProps) => {
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [isClosing, setIsClosing] = useState<boolean>(false)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)

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

  const handleDelete = async () => {
    if (!cliente) return
    setIsDeleting(true)
    const success = await onConfirm(cliente.cliente_id)
    if (success) {
      window.location.reload()
    }
    setIsDeleting(false)
  }

  if (!isVisible || !cliente) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm ${isClosing ? "modal-hide" : "modal-show"}`}
      onClick={handleClose}
    >
      <div
        className={`bg-surface border border-muted rounded-2xl w-[90%] max-w-md p-6 shadow-2xl relative ${isClosing ? "modal-content-hide" : "modal-content-show"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-warning/20 flex items-center justify-center mb-4">
            <AlertTriangle size={28} className="text-warning" />
          </div>

          <h2 className="text-primary text-xl font-bold mb-2">
            ¿Eliminar cuenta?
          </h2>

          <p className="text-text-muted text-sm leading-relaxed max-w-xs">
            ¿Estás seguro de que quieres eliminar a <span className="text-text font-medium">{cliente.nombre} {cliente.apellido}</span>? Esta acción es irreversible.
          </p>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            type="button"
            onClick={handleClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-lg border-2 border-muted text-text text-sm font-medium hover:bg-muted/30 transition-colors duration-200 cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-lg bg-danger text-white text-sm font-medium hover:bg-danger/80 transition-colors duration-200 cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  )
}

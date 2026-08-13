import { useState, useEffect } from "react"
import { AlertTriangle } from "lucide-react"
import type { Turno } from "../../Types/Turno"

interface CancelarTurnoModalProps {
  isOpen: boolean
  turno: Turno | null
  onClose: () => void
  onConfirm: (id: number) => Promise<{ message: string } | null>
}

export const CancelarTurnoModal = ({ isOpen, turno, onClose, onConfirm }: CancelarTurnoModalProps) => {
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [isClosing, setIsClosing] = useState<boolean>(false)
  const [isCanceling, setIsCanceling] = useState<boolean>(false)

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

  const handleConfirm = async () => {
    if (!turno) return
    setIsCanceling(true)
    await onConfirm(turno.turno_id)
    setIsCanceling(false)
    handleClose()
  }

  if (!isVisible || !turno) return null

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
          <div className="w-14 h-14 rounded-full bg-danger/20 flex items-center justify-center mb-4">
            <AlertTriangle size={28} className="text-danger" />
          </div>

          <h2 className="text-primary text-xl font-bold mb-2">
            Cancelar turno
          </h2>

          <p className="text-text-muted text-sm leading-relaxed max-w-sm">
            ¿Estás seguro de que quieres cancelar el{" "}
            <span className="text-text font-medium">{turno.titulo}</span> de{" "}
            <span className="text-text font-medium">{turno.cliente_nombre} {turno.cliente_apellido}</span>? Esta opción es irreversible.
          </p>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            type="button"
            onClick={handleClose}
            disabled={isCanceling}
            className="flex-1 py-2.5 rounded-lg border-2 border-muted text-text text-sm font-medium hover:bg-muted/30 transition-colors duration-200 cursor-pointer disabled:opacity-50"
          >
            Salir
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isCanceling}
            className="flex-1 py-2.5 rounded-lg bg-danger text-white text-sm font-medium hover:bg-danger/80 transition-colors duration-200 cursor-pointer disabled:opacity-50"
          >
            {isCanceling ? "Cancelando..." : "Cancelar"}
          </button>
        </div>
      </div>
    </div>
  )
}

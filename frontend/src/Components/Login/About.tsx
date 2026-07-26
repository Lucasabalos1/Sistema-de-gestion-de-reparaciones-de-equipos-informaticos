import { useState, useEffect } from "react"

export interface AboutProps {
  isOpen: boolean
  onClose: () => void
}

export const About = ({ isOpen, onClose }: AboutProps) => {
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

  if (!isVisible) return null

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
          className="absolute top-4 right-4 text-text-muted hover:text-danger transition-colors duration-200 text-xl leading-none cursor-pointer"
        >
          ✕
        </button>

        <h2 className="text-primary text-xl font-bold mb-4 pr-6">
          ¿Qué es ByteMend?
        </h2>
        <p className="text-text text-sm leading-relaxed mb-4">
          ByteMend es un sistema de gestión y administración de servicios de mantenimiento y reparación de computadoras. Permite gestionar turnos, clientes, inventario y todo lo relacionado con el taller de reparación de forma profesional y eficiente.
        </p>
        <p className="text-text-muted text-xs leading-relaxed">
          Este sistema está diseñado para que los técnicos puedan trabajar en un entorno organizado, controlando cada aspecto del proceso de reparación desde la recepción del equipo hasta su entrega.
        </p>
      </div>
    </div>
  )
}

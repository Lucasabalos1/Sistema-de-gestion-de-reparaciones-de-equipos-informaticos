import { useState, useEffect } from "react"
import { Wrench, X } from "lucide-react"
import type { Servicio, ServicioFormData } from "../../Types/Servicio"

interface ServicioFormModalProps {
  isOpen: boolean
  onClose: () => void
  servicio?: Servicio | null
  onSubmit: (data: ServicioFormData) => Promise<{ message: string } | null>
}

export const ServicioFormModal = ({ isOpen, onClose, servicio, onSubmit }: ServicioFormModalProps) => {
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [isClosing, setIsClosing] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const [nombre, setNombre] = useState("")
  const [precio, setPrecio] = useState("")
  const [estado, setEstado] = useState<boolean>(true)
  const [errores, setErrores] = useState<Record<string, string>>({})

  const isEditing = !!servicio

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setIsClosing(false)
      setNombre(servicio?.nombre ?? "")
      setPrecio(servicio ? String(servicio.precio) : "")
      setEstado(servicio?.estado ?? true)
      setErrores({})
    }
  }, [isOpen, servicio])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsVisible(false)
      setIsClosing(false)
      onClose()
    }, 200)
  }

  const validar = (): boolean => {
    const nuevos: Record<string, string> = {}
    const precioNum = Number(precio)

    if (!isEditing && !nombre.trim()) nuevos.nombre = "El nombre es obligatorio"
    if (!precio.trim()) nuevos.precio = "El precio es obligatorio"
    else if (Number.isNaN(precioNum) || precioNum <= 0) nuevos.precio = "Ingresa un precio válido"

    setErrores(nuevos)
    return Object.keys(nuevos).length === 0
  }

  const handleSubmit = async () => {
    if (!validar()) return
    setIsSubmitting(true)
    const result = await onSubmit({ nombre, precio: Number(precio), estado })
    setIsSubmitting(false)
    if (result) {
      handleClose()
    }
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
          className="absolute top-4 right-4 text-text-muted hover:text-danger transition-colors duration-200 cursor-pointer"
        >
          <X size={20} />
        </button>

        <h2 className="text-primary text-xl font-bold mb-4 pr-6">
          {isEditing ? "Editar servicio" : "Añadir servicio"}
        </h2>

        <div className="border-b border-muted mb-6" />

        <form
          onSubmit={(e) => { e.preventDefault(); handleSubmit() }}
          className="space-y-4"
        >
          <div>
            <label className="block text-text text-sm font-medium mb-1">
              Nombre del servicio <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={nombre}
              disabled={isEditing}
              onChange={(e) => { setNombre(e.target.value); setErrores((prev) => ({ ...prev, nombre: "" })) }}
              placeholder="Ingresa el nombre del servicio"
              className={`w-full px-3 py-2 rounded-lg bg-background border-2 text-text text-sm placeholder-text-muted/60 outline-none transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${errores.nombre ? "border-danger" : "border-muted focus:border-accent"}`}
            />
            {errores.nombre && <p className="text-danger text-xs mt-1">{errores.nombre}</p>}
          </div>

          <div>
            <label className="block text-text text-sm font-medium mb-1">
              Precio <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={precio}
              onChange={(e) => { setPrecio(e.target.value); setErrores((prev) => ({ ...prev, precio: "" })) }}
              placeholder="Ingresa el precio"
              className={`w-full px-3 py-2 rounded-lg bg-background border-2 text-text text-sm placeholder-text-muted/60 outline-none transition-colors duration-200 ${errores.precio ? "border-danger" : "border-muted focus:border-accent"}`}
            />
            {errores.precio && <p className="text-danger text-xs mt-1">{errores.precio}</p>}
          </div>

          {isEditing && (
            <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-background border-2 border-muted">
              <div className="flex items-center gap-2 min-w-0">
                <Wrench size={16} className="text-text-muted shrink-0" />
                <span className="text-text text-sm font-medium">Servicio</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-medium ${estado ? "text-success" : "text-danger"}`}>
                  {estado ? "Activo" : "Inactivo"}
                </span>
                <button
                  type="button"
                  onClick={() => setEstado(!estado)}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer ${estado ? "bg-success" : "bg-muted"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${estado ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/80 transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isSubmitting
              ? (isEditing ? "Guardando..." : "Agregando...")
              : (isEditing ? "Guardar" : "Agregar")
            }
          </button>
        </form>
      </div>
    </div>
  )
}

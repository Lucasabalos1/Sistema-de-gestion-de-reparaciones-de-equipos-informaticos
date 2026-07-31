import { useState, useEffect } from "react"
import { X } from "lucide-react"
import type { Cliente, ClienteFormData } from "../../Types/Cliente"

interface ClienteFormModalProps {
  isOpen: boolean
  onClose: () => void
  cliente?: Cliente | null
  onSubmit: (data: ClienteFormData) => Promise<{ message: string } | null>
}

export const ClienteFormModal = ({ isOpen, onClose, cliente, onSubmit }: ClienteFormModalProps) => {
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [isClosing, setIsClosing] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [telefono, setTelefono] = useState("")
  const [correo, setCorreo] = useState("")
  const [genero, setGenero] = useState("")
  const [errores, setErrores] = useState<Record<string, string>>({})

  const isEditing = !!cliente

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setIsClosing(false)
      if (cliente) {
        setNombre(cliente.nombre)
        setApellido(cliente.apellido === "No hay datos por el momento" ? "" : cliente.apellido)
        setTelefono(cliente.telefono)
        setCorreo(cliente.correo === "No hay datos por el momento" ? "" : cliente.correo)
        setGenero(cliente.genero === "No hay datos por el momento" ? "" : cliente.genero)
      } else {
        setNombre("")
        setApellido("")
        setTelefono("")
        setCorreo("")
        setGenero("")
      }
      setErrores({})
    }
  }, [isOpen, cliente])

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

    if (!nombre.trim()) nuevos.nombre = "El nombre es obligatorio"
    if (!telefono.trim()) nuevos.telefono = "El teléfono es obligatorio"

    setErrores(nuevos)
    return Object.keys(nuevos).length === 0
  }

  const handleSubmit = async () => {
    if (!validar()) return
    setIsSubmitting(true)
    const result = await onSubmit({ nombre, apellido, telefono, correo, genero })
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

        <h2 className="text-primary text-xl font-bold mb-6 pr-6">
          {isEditing ? "Editar cliente" : "Añadir cliente"}
        </h2>

        <form
          onSubmit={(e) => { e.preventDefault(); handleSubmit() }}
          className="space-y-4"
        >
          <div>
            <label className="block text-text text-sm font-medium mb-1">
              Nombre <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => { setNombre(e.target.value); setErrores((prev) => ({ ...prev, nombre: "" })) }}
              placeholder="Ingresa el nombre"
              className={`w-full px-3 py-2 rounded-lg bg-background border-2 text-text text-sm placeholder-text-muted/60 outline-none transition-colors duration-200 ${errores.nombre ? "border-danger" : "border-muted focus:border-accent"}`}
            />
            {errores.nombre && <p className="text-danger text-xs mt-1">{errores.nombre}</p>}
          </div>

          <div>
            <label className="block text-text text-sm font-medium mb-1">
              Apellido
            </label>
            <input
              type="text"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              placeholder="Ingresa el apellido"
              className="w-full px-3 py-2 rounded-lg bg-background border-2 border-muted text-text text-sm placeholder-text-muted/60 outline-none focus:border-accent transition-colors duration-200"
            />
          </div>

          <div>
            <label className="block text-text text-sm font-medium mb-1">
              Teléfono <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={telefono}
              onChange={(e) => { setTelefono(e.target.value); setErrores((prev) => ({ ...prev, telefono: "" })) }}
              placeholder="Ingresa el teléfono"
              className={`w-full px-3 py-2 rounded-lg bg-background border-2 text-text text-sm placeholder-text-muted/60 outline-none transition-colors duration-200 ${errores.telefono ? "border-danger" : "border-muted focus:border-accent"}`}
            />
            {errores.telefono && <p className="text-danger text-xs mt-1">{errores.telefono}</p>}
          </div>

          <div>
            <label className="block text-text text-sm font-medium mb-1">
              Correo
            </label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="Ingresa el correo"
              className="w-full px-3 py-2 rounded-lg bg-background border-2 border-muted text-text text-sm placeholder-text-muted/60 outline-none focus:border-accent transition-colors duration-200"
            />
          </div>

          <div>
            <label className="block text-text text-sm font-medium mb-1">
              Género
            </label>
            <select
              value={genero}
              onChange={(e) => setGenero(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-background border-2 border-muted text-text text-sm outline-none focus:border-accent transition-colors duration-200 appearance-none cursor-pointer"
            >
              <option value="" disabled>Selecciona un género</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/80 transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isSubmitting
              ? (isEditing ? "Guardando..." : "Creando...")
              : (isEditing ? "Guardar cambios" : "Crear cliente")
            }
          </button>
        </form>
      </div>
    </div>
  )
}

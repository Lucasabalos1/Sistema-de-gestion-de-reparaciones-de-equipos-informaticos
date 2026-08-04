import { useState, useEffect } from "react"
import { X } from "lucide-react"
import type { Inventario, InventarioFormData } from "../../Types/Inventory"

interface InventarioFormModalProps {
  isOpen: boolean
  onClose: () => void
  item?: Inventario | null
  onSubmit: (data: Omit<InventarioFormData, "admin_id">) => Promise<{ message: string } | null>
}

export const InventarioFormModal = ({ isOpen, onClose, item, onSubmit }: InventarioFormModalProps) => {
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [isClosing, setIsClosing] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const [nombre, setNombre] = useState("")
  const [stock, setStock] = useState("")
  const [precio, setPrecio] = useState("")
  const [errores, setErrores] = useState<Record<string, string>>({})

  const isEditing = !!item

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setIsClosing(false)
      setNombre(item?.nombre ?? "")
      setStock(item ? String(item.stock) : "")
      setPrecio(item ? String(item.precio_unidad) : "")
      setErrores({})
    }
  }, [isOpen, item])

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
    const stockNum = Number(stock)
    const precioNum = Number(precio)

    if (!nombre.trim()) nuevos.nombre = "El nombre es obligatorio"
    if (!stock.trim()) nuevos.stock = "El stock es obligatorio"
    else if (Number.isNaN(stockNum) || !Number.isInteger(stockNum) || stockNum < 0) nuevos.stock = "Ingresa un stock válido"
    if (!precio.trim()) nuevos.precio = "El precio es obligatorio"
    else if (Number.isNaN(precioNum) || precioNum <= 0) nuevos.precio = "Ingresa un precio válido"

    setErrores(nuevos)
    return Object.keys(nuevos).length === 0
  }

  const handleSubmit = async () => {
    if (!validar()) return
    setIsSubmitting(true)
    const result = await onSubmit({ nombre: nombre.trim(), stock: Number(stock), precio_unidad: Number(precio) })
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
          {isEditing ? "Editar Producto" : "Agregar Producto"}
        </h2>

        <div className="border-b border-muted mb-6" />

        <form
          onSubmit={(e) => { e.preventDefault(); handleSubmit() }}
          className="space-y-4"
        >
          <div>
            <label className="block text-text text-sm font-medium mb-1">
              Nombre del producto <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => { setNombre(e.target.value); setErrores((prev) => ({ ...prev, nombre: "" })) }}
              placeholder="Ingresa el nombre del producto"
              className={`w-full px-3 py-2 rounded-lg bg-background border-2 text-text text-sm placeholder-text-muted/60 outline-none transition-colors duration-200 ${errores.nombre ? "border-danger" : "border-muted focus:border-accent"}`}
            />
            {errores.nombre && <p className="text-danger text-xs mt-1">{errores.nombre}</p>}
          </div>

          <div>
            <label className="block text-text text-sm font-medium mb-1">
              Stock <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={stock}
              onChange={(e) => { setStock(e.target.value); setErrores((prev) => ({ ...prev, stock: "" })) }}
              placeholder="Ingresa el stock"
              className={`w-full px-3 py-2 rounded-lg bg-background border-2 text-text text-sm placeholder-text-muted/60 outline-none transition-colors duration-200 ${errores.stock ? "border-danger" : "border-muted focus:border-accent"}`}
            />
            {errores.stock && <p className="text-danger text-xs mt-1">{errores.stock}</p>}
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

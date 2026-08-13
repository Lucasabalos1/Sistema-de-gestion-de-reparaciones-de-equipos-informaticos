import { useState, useEffect } from "react"
import { X, Search } from "lucide-react"
import type { Servicio } from "../../Types/Servicio"

interface ServiciosSelectModalProps {
  isOpen: boolean
  onClose: () => void
  selectedIds: number[]
  onConfirm: (ids: number[]) => void
  servicios: Servicio[]
  isLoading: boolean
  onBuscar: (nombre: string) => Promise<void>
}

export const ServiciosSelectModal = ({ isOpen, onClose, selectedIds, onConfirm, servicios, isLoading, onBuscar }: ServiciosSelectModalProps) => {
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [isClosing, setIsClosing] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [selected, setSelected] = useState<number[]>([])

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setIsClosing(false)
      setSearchTerm("")
      setSelected(selectedIds)
    }
  }, [isOpen, selectedIds])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsVisible(false)
      setIsClosing(false)
      onClose()
    }, 200)
  }

  const handleBuscar = async () => {
    await onBuscar(searchTerm)
  }

  const toggleServicio = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const handleConfirm = () => {
    onConfirm(selected)
    handleClose()
  }

  const serviciosSeleccionados = servicios.filter((s) => selected.includes(s.servicio_id))

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm ${isClosing ? "modal-hide" : "modal-show"}`}
      onClick={handleClose}
    >
      <div
        className={`bg-surface border border-muted rounded-2xl w-[90%] max-w-lg p-6 shadow-2xl relative flex flex-col ${isClosing ? "modal-content-hide" : "modal-content-show"}`}
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
          Seleccionar servicios
        </h2>

        <div className="flex items-center gap-2 mb-5">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ingresa el nombre de servicio a buscar y presiona buscar"
              className="w-full px-4 py-2.5 rounded-lg bg-background border-2 border-muted text-text text-sm placeholder-text-muted/60 outline-none focus:border-accent transition-colors duration-200"
            />
          </div>
          <button
            type="button"
            onClick={handleBuscar}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/80 transition-colors duration-200 cursor-pointer shrink-0"
          >
            <Search size={16} />
            Buscar
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : servicios.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 mb-5">
            <p className="text-text-muted text-sm">No se encontraron servicios</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-52 overflow-y-auto mb-5">
            {servicios.map((servicio) => {
              const isSelected = selected.includes(servicio.servicio_id)
              return (
                <div
                  key={servicio.servicio_id}
                  className="flex items-center justify-between rounded-lg p-3 border border-muted bg-background"
                >
                  <div className="min-w-0">
                    <p className="text-text font-medium text-sm truncate">{servicio.nombre}</p>
                    <p className="text-text-muted text-xs mt-0.5">${servicio.precio.toLocaleString()}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleServicio(servicio.servicio_id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 cursor-pointer shrink-0 ml-3 ${
                      isSelected
                        ? "bg-danger/10 text-danger hover:bg-danger/20"
                        : "bg-accent/10 text-accent hover:bg-accent/20"
                    }`}
                  >
                    {isSelected ? "quitar" : "Seleccionar"}
                  </button>
                </div>
              )
            })}
          </div>
        )}

        <div className="rounded-lg p-3 border border-muted bg-background mb-5">
          <p className="text-text-muted text-xs font-semibold uppercase tracking-wide mb-2">
            Seleccionados
          </p>
          {serviciosSeleccionados.length === 0 ? (
            <p className="text-text-muted text-xs">Sin servicios seleccionados</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {serviciosSeleccionados.map((servicio) => (
                <span
                  key={servicio.servicio_id}
                  className="px-2 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium"
                >
                  {servicio.nombre}
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          className="w-full py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/80 transition-colors duration-200 cursor-pointer"
        >
          Cargar servicios
        </button>
      </div>
    </div>
  )
}

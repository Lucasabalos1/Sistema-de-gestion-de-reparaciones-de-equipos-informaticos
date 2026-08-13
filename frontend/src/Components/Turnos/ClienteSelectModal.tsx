import { useState, useEffect } from "react"
import { X, Search } from "lucide-react"
import type { Cliente } from "../../Types/Cliente"

interface ClienteSelectModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (cliente: Cliente) => void
  clientes: Cliente[]
  isLoading: boolean
  onBuscar: (termino: string) => Promise<void>
}

export const ClienteSelectModal = ({ isOpen, onClose, onSelect, clientes, isLoading, onBuscar }: ClienteSelectModalProps) => {
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [isClosing, setIsClosing] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>("")

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setIsClosing(false)
      setSearchTerm("")
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

  const handleBuscar = async () => {
    await onBuscar(searchTerm)
  }

  const handleSelect = (cliente: Cliente) => {
    onSelect(cliente)
    handleClose()
  }

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm ${isClosing ? "modal-hide" : "modal-show"}`}
      onClick={handleClose}
    >
      <div
        className={`bg-surface border border-muted rounded-2xl w-[90%] max-w-lg p-6 shadow-2xl relative ${isClosing ? "modal-content-hide" : "modal-content-show"}`}
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
          Seleccionar cliente
        </h2>

        <div className="flex items-center gap-2 mb-5">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ingresa el numero de telefono y presiona buscar"
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
        ) : clientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <p className="text-text-muted text-sm">No se encontraron clientes</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {clientes.map((cliente) => (
              <div
                key={cliente.cliente_id}
                className="flex items-center justify-between rounded-lg p-3 border border-muted bg-background"
              >
                <div className="min-w-0">
                  <p className="text-text font-medium text-sm truncate">
                    {cliente.nombre} {cliente.apellido}
                  </p>
                  <p className="text-text-muted text-xs mt-0.5">{cliente.telefono}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelect(cliente)}
                  className="px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-medium hover:bg-accent/20 transition-colors duration-200 cursor-pointer shrink-0 ml-3"
                >
                  Seleccionar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

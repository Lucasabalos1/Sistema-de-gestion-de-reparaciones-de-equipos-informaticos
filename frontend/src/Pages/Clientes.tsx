import { useState, useEffect } from "react"
import { Layout } from "../Components/Global/Layout"
import { ClienteCard } from "../Components/Clientes/ClienteCard"
import { ClienteFormModal } from "../Components/Clientes/ClienteFormModal"
import { ClienteDetailModal } from "../Components/Clientes/ClienteDetailModal"
import { ClienteDeleteModal } from "../Components/Clientes/ClienteDeleteModal"
import { useClientes } from "../Hooks/useClientes"
import type { Cliente } from "../Types/Cliente"
import { Plus, Search, X, Users, AlertCircle } from "lucide-react"

export const Clientes = () => {
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [showFormModal, setShowFormModal] = useState<boolean>(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [deletingCliente, setDeletingCliente] = useState<Cliente | null>(null)
  const { clientes, isLoading, error, fetchClientes, createCliente, updateCliente, deleteCliente, searchCliente } = useClientes()

  const handleFormClose = () => {
    setShowFormModal(false)
    setEditingCliente(null)
  }

  const handleBuscar = async () => {
    if (searchTerm.trim()) {
      await searchCliente(searchTerm)
    } else {
      await fetchClientes()
    }
  }

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente)
    setShowFormModal(true)
    setSelectedCliente(null)
  }

  const formSubmit = editingCliente
    ? (data: Parameters<typeof createCliente>[0]) => updateCliente(editingCliente.cliente_id, data)
    : createCliente

  useEffect(() => {
    fetchClientes()
  }, [fetchClientes])

  return (
    <Layout>
      <div className="w-full max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">
              Gestión de clientes
            </h1>
            <p className="text-text-muted text-sm mt-1">
              Módulo para la gestión de clientes del local.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowFormModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/80 transition-colors duration-200 cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Plus size={18} />
            Añadir cliente
          </button>
        </div>

        <div className="mt-3 mb-6 border-b-2 border-muted w-full" />

        {/* Barra de búsqueda */}
        <div className="flex items-center gap-2 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleBuscar() } }}
              placeholder="Ingresa un numero telefonico y presiona buscar"
              className="w-full px-4 py-2.5 pr-10 rounded-lg bg-surface border-2 border-muted text-text text-sm placeholder-text-muted/60 outline-none focus:border-accent transition-colors duration-200"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => { setSearchTerm(""); fetchClientes() }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors duration-200 cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
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

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-text-muted text-sm">Cargando clientes...</span>
          </div>
        )}

        {/* Error real (no confundir con "no hay clientes") */}
        {!isLoading && error && error !== "No hay clientes registrados" && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-danger/10 border border-danger/30 mb-6">
            <AlertCircle size={20} className="text-danger shrink-0" />
            <div className="flex-1">
              <p className="text-danger text-sm font-medium">Error al cargar clientes</p>
              <p className="text-text-muted text-xs mt-1">{error}</p>
            </div>
            <button
              type="button"
              onClick={fetchClientes}
              className="text-danger hover:text-danger/80 text-xs font-medium underline cursor-pointer shrink-0"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Vacío */}
        {!isLoading && clientes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <Users size={48} className="text-text-muted/40 mb-4" />
            <p className="text-text-muted text-sm">No hay clientes registrados</p>
          </div>
        )}

        {/* Grid de tarjetas */}
        {clientes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientes.map((cliente) => (
              <ClienteCard
                key={cliente.cliente_id}
                cliente={cliente}
                onClick={() => setSelectedCliente(cliente)}
              />
            ))}
          </div>
        )}

        <ClienteFormModal
          isOpen={showFormModal}
          onClose={handleFormClose}
          cliente={editingCliente}
          onSubmit={formSubmit}
        />

        <ClienteDetailModal
          isOpen={!!selectedCliente}
          cliente={selectedCliente}
          onClose={() => setSelectedCliente(null)}
          onEdit={() => selectedCliente && handleEdit(selectedCliente)}
          onDelete={() => {
            setDeletingCliente(selectedCliente)
            setSelectedCliente(null)
          }}
        />

        <ClienteDeleteModal
          isOpen={!!deletingCliente}
          cliente={deletingCliente}
          onClose={() => setDeletingCliente(null)}
          onConfirm={deleteCliente}
        />
      </div>
    </Layout>
  )
}

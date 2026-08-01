import { useState } from "react"
import { Layout } from "../Components/Global/Layout"
import { ServicioCard } from "../Components/Servicios/ServicioCard"
import { ServicioFormModal } from "../Components/Servicios/ServicioFormModal"
import { useServicios } from "../Hooks/useServicios"
import { AlertCircle, Plus, Search, Wrench, X } from "lucide-react"
import type { Servicio } from "../Types/Servicio"

export const Servicios = () => {
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [showFormModal, setShowFormModal] = useState<boolean>(false)
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null)
  const { servicios, isLoading, error, fetchServicios, searchServicio, createServicio, updateServicio } = useServicios()

  const handleFormClose = () => {
    setShowFormModal(false)
    setEditingServicio(null)
  }

  const handleEdit = (servicio: Servicio) => {
    setEditingServicio(servicio)
    setShowFormModal(true)
  }

  const formSubmit = editingServicio
    ? (data: Parameters<typeof createServicio>[0]) => updateServicio(editingServicio.servicio_id, data)
    : createServicio

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      await searchServicio(searchTerm)
    } else {
      await fetchServicios()
    }
  }

  const handleClear = async () => {
    setSearchTerm("")
    await fetchServicios()
  }

  return (
    <Layout>
      <div className="w-full max-w-6xl">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Gestión de servicios
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Módulo para la gestión de servicios del taller.
          </p>
          <button
            type="button"
            onClick={() => setShowFormModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/80 transition-colors duration-200 cursor-pointer mt-4"
          >
            <Plus size={18} />
            Añadir servicio
          </button>        </div>

        <div className="mt-4 mb-6 border-b-2 border-muted w-full" />

        {/* Barra de búsqueda */}
        <div className="flex items-center gap-2 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch() }}
              placeholder="Ingresa el nombre de servicio a buscar y presiona buscar"
              className="w-full px-4 py-2.5 pr-10 rounded-lg bg-surface border-2 border-muted text-text text-sm placeholder-text-muted/60 outline-none focus:border-accent transition-colors duration-200"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors duration-200 cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={handleSearch}
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
            <span className="ml-3 text-text-muted text-sm">Cargando servicios...</span>
          </div>
        )}

        {/* Error real (no confundir con "no hay servicios") */}
        {!isLoading && error && error !== "No hay servicios registrados" && error !== "No se encontraron servicios con ese nombre." && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-danger/10 border border-danger/30 mb-6">
            <AlertCircle size={20} className="text-danger shrink-0" />
            <div className="flex-1">
              <p className="text-danger text-sm font-medium">Error al cargar servicios</p>
              <p className="text-text-muted text-xs mt-1">{error}</p>
            </div>
            <button
              type="button"
              onClick={fetchServicios}
              className="text-danger hover:text-danger/80 text-xs font-medium underline cursor-pointer shrink-0"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Vacío */}
        {!isLoading && servicios.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <Wrench size={48} className="text-text-muted/40 mb-4" />
            <p className="text-text-muted text-sm">No hay servicios registrados</p>
          </div>
        )}

        {/* Grid de tarjetas */}
        {servicios.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {servicios.map((servicio) => (
              <ServicioCard
                key={servicio.servicio_id}
                servicio={servicio}
                onEdit={() => handleEdit(servicio)}
              />
            ))}
          </div>
        )}
      </div>

      <ServicioFormModal
        isOpen={showFormModal}
        onClose={handleFormClose}
        servicio={editingServicio}
        onSubmit={formSubmit}
      />
    </Layout>
  )
}

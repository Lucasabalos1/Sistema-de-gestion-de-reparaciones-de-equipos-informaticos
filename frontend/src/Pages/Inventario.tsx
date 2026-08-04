import { useState } from "react"
import { Layout } from "../Components/Global/Layout"
import { InventarioTable } from "../Components/Inventario/InventarioTable"
import { InventarioFormModal } from "../Components/Inventario/InventarioFormModal"
import { InventarioCsvModal } from "../Components/Inventario/InventarioCsvModal"
import { useInventario } from "../Hooks/useInventario"
import { FileUp, Plus, Search, X } from "lucide-react"
import type { Inventario as InventarioItem } from "../Types/Inventory"

export const Inventario = () => {
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [showFormModal, setShowFormModal] = useState<boolean>(false)
    const [showCsvModal, setShowCsvModal] = useState<boolean>(false)
    const [editingItem, setEditingItem] = useState<InventarioItem | null>(null)
    const { inventario, isLoading, error, fetchInventario, searchInventario, createInventario, updateInventario, importarCsv } = useInventario()

    const handleFormClose = () => {
        setShowFormModal(false)
        setEditingItem(null)
    }

    const handleEdit = (item: InventarioItem) => {
        setEditingItem(item)
        setShowFormModal(true)
    }

    const formSubmit = editingItem
        ? (data: Parameters<typeof createInventario>[0]) => updateInventario(editingItem.repuesto_id, data)
        : createInventario

    const handleSearch = async () => {
        if (searchTerm.trim()) {
            await searchInventario(searchTerm)
        } else {
            await fetchInventario()
        }
    }

    const handleClear = async () => {
        setSearchTerm("")
        await fetchInventario()
    }

    return (
        <Layout>
            <div className="w-full max-w-6xl">
                <div>
                    <h1 className="text-3xl font-bold text-primary">
                        Gestión de Inventario
                    </h1>
                    <p className="text-text-muted text-sm mt-1">
                        Módulo para la gestión de inventario del taller.
                    </p>

                </div>

                <div className="mt-4 mb-4 border-b-2 border-muted w-full" />

                <div className="flex items-center gap-3 mb-4">
                    <button
                        type="button"
                        onClick={() => setShowFormModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/80 transition-colors duration-200 cursor-pointer"
                    >
                        <Plus size={18} />
                        Carga Manual
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowCsvModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/80 transition-colors duration-200 cursor-pointer"
                    >
                        <FileUp size={18} />
                        Carga Automatica
                    </button>
                </div>

                <div className="flex items-center gap-2 mb-6">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleSearch() }}
                            placeholder="Ingresa el nombre de item a buscar y presiona buscar"
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

                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                        <span className="ml-3 text-text-muted text-sm">Cargando inventario...</span>
                    </div>
                )}

                {!isLoading && error && error !== "No hay repuestos en el inventario" && error !== "No se encontraron repuestos con ese nombre." && (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-danger/10 border border-danger/30 mb-6">
                        <p className="text-danger text-sm font-medium">{error}</p>
                    </div>
                )}

                {!isLoading && inventario.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16">
                        <p className="text-text-muted text-sm">No hay repuestos en el inventario</p>
                    </div>
                )}

                {!isLoading && inventario.length > 0 && (
                    <InventarioTable
                        items={inventario}
                        onEdit={handleEdit}
                    />
                )}
            </div>

            <InventarioFormModal
                isOpen={showFormModal}
                onClose={handleFormClose}
                item={editingItem}
                onSubmit={formSubmit}
            />

            <InventarioCsvModal
                isOpen={showCsvModal}
                onClose={() => setShowCsvModal(false)}
                onImport={importarCsv}
                error={error}
            />
        </Layout>
    )
}


import { useState, useEffect } from "react"
import { Layout } from "../Components/Global/Layout"
import { TurnosKanban } from "../Components/Turnos/TurnosKanban"
import { HistorialTurnos } from "../Components/Turnos/HistorialTurnos"
import { TurnoFormModal } from "../Components/Turnos/TurnoFormModal"
import { useTurnos } from "../Hooks/useTurnos"
import type { Turno, TurnoFormData } from "../Types/Turno"
import { Plus, AlertCircle } from "lucide-react"

export const Turnos = () => {
    const [activeTab, setActiveTab] = useState<"tablero" | "historial">("tablero")
    const [showFormModal, setShowFormModal] = useState<boolean>(false)
    const [editingTurno, setEditingTurno] = useState<Turno | null>(null)
    const { kanban, historial, isLoading, error, fetchTurnos, fetchHistorial, crearTurno, editarTurno, cambiarEstadoTecnico, cambiarEstadoComercial, cancelarTurno } = useTurnos()

    useEffect(() => {
        fetchTurnos()
        fetchHistorial()
    }, [fetchTurnos, fetchHistorial])

    const handleFormClose = () => {
        setShowFormModal(false)
        setEditingTurno(null)
    }

    const handleEditar = (turno: Turno) => {
        setEditingTurno(turno)
        setShowFormModal(true)
    }

    const formSubmit = editingTurno
        ? (data: TurnoFormData) => editarTurno(editingTurno.turno_id, data)
        : crearTurno

    return (
        <Layout>
            <div className="w-full max-w-6xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-primary">
                            Gestión de turnos
                        </h1>
                        <p className="text-text-muted text-sm mt-1">
                            Módulo para la gestión de turnos del taller.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => { setEditingTurno(null); setShowFormModal(true) }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/80 transition-colors duration-200 cursor-pointer shrink-0 self-start sm:self-auto"
                    >
                        <Plus size={18} />
                        Crear turno
                    </button>
                </div>

                <div className="mt-3 mb-6 border-b-2 border-muted w-full" />

                <div className="flex justify-center mb-6">
                    <div className="flex w-full sm:w-auto sm:inline-flex p-1 rounded-lg bg-surface border border-muted gap-1">
                        <button
                            type="button"
                            onClick={() => setActiveTab("tablero")}
                            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-2 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer ${
                                activeTab === "tablero"
                                    ? "bg-accent text-white"
                                    : "text-text-muted hover:text-text"
                            }`}
                        >
                            Tablero
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("historial")}
                            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-2 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer ${
                                activeTab === "historial"
                                    ? "bg-accent text-white"
                                    : "text-text-muted hover:text-text"
                            }`}
                        >
                            Historial
                        </button>
                    </div>
                </div>

                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                        <span className="ml-3 text-text-muted text-sm">Cargando turnos...</span>
                    </div>
                )}

                {!isLoading && error && (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-danger/10 border border-danger/30 mb-6">
                        <AlertCircle size={20} className="text-danger shrink-0" />
                        <div className="flex-1">
                            <p className="text-danger text-sm font-medium">Error al cargar turnos</p>
                            <p className="text-text-muted text-xs mt-1">{error}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => { fetchTurnos(); fetchHistorial() }}
                            className="text-danger hover:text-danger/80 text-xs font-medium underline cursor-pointer shrink-0"
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {!isLoading && activeTab === "tablero" && (
                    <TurnosKanban
                        kanban={kanban}
                        onCambiarEstadoTecnico={cambiarEstadoTecnico}
                        onCambiarEstadoComercial={cambiarEstadoComercial}
                        onCancelarTurno={cancelarTurno}
                        onEditar={handleEditar}
                    />
                )}
                {!isLoading && activeTab === "historial" && <HistorialTurnos historial={historial} />}

                <TurnoFormModal
                    isOpen={showFormModal}
                    onClose={handleFormClose}
                    turno={editingTurno}
                    onSubmit={formSubmit}
                />
            </div>
        </Layout>
    )
}

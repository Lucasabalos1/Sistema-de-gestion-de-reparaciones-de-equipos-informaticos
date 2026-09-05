import { useState } from "react"
import { Layout } from "../Components/Global/Layout"
import { MetricasMensuales } from "../Components/Metricas/MetricasMensuales"
import { MetricasGlobales } from "../Components/Metricas/MetricasGlobales"
import { useMetricas } from "../Hooks/useMetricas"
import { Search, BarChart3, AlertCircle } from "lucide-react"

const MESES = [
  { value: "", label: "Seleccione el mes" },
  { value: "1", label: "Enero" },
  { value: "2", label: "Febrero" },
  { value: "3", label: "Marzo" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Mayo" },
  { value: "6", label: "Junio" },
  { value: "7", label: "Julio" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
]

export const Metricas = () => {
  const [activeTab, setActiveTab] = useState<"mensual" | "global">("mensual")
  const [mesSeleccionado, setMesSeleccionado] = useState<string>("")
  const [anioSeleccionado, setAnioSeleccionado] = useState<string>("")
  const [hasSearched, setHasSearched] = useState<boolean>(false)

  const { metricasMensual, metricasGlobal, isLoading, error, fetchMensual, fetchGlobal } = useMetricas()

  const handleBuscar = async () => {
    if (!anioSeleccionado) return
    setHasSearched(true)
    if (activeTab === "mensual") {
      if (!mesSeleccionado) return
      await fetchMensual(Number(mesSeleccionado), Number(anioSeleccionado))
    } else {
      await fetchGlobal(Number(anioSeleccionado))
    }
  }

  return (
    <Layout>
      <div className="w-full max-w-6xl">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Gestión de métricas
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Módulo para la gestión de métricas del taller.
          </p>
        </div>

        <div className="mt-3 mb-6 border-b-2 border-muted w-full" />

        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <div className="flex w-full sm:w-auto sm:inline-flex p-1 rounded-lg bg-surface border border-muted gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("mensual")}
              className={`flex-1 sm:flex-none px-6 sm:px-10 py-2.5 sm:py-2 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer ${
                activeTab === "mensual"
                  ? "bg-accent text-white"
                  : "text-text-muted hover:text-text"
              }`}
            >
              Mensuales
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("global")}
              className={`flex-1 sm:flex-none px-6 sm:px-10 py-2.5 sm:py-2 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer ${
                activeTab === "global"
                  ? "bg-accent text-white"
                  : "text-text-muted hover:text-text"
              }`}
            >
              Anuales
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-6">
          {activeTab === "mensual" && (
            <div className="flex-1">
              <label className="block text-text-muted text-base mb-2 text-center.5">Mes</label>
              <select
                value={mesSeleccionado}
                onChange={(e) => setMesSeleccionado(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface border border-muted rounded-lg text-text text-sm focus:outline-none focus:border-accent transition-colors duration-200 cursor-pointer"
              >
                {MESES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className={`${activeTab === "mensual" ? "flex-1" : "w-full sm:w-80 sm:mx-auto"}`}>
            <label className="block text-text-muted text-base mb-2 text-center.5">Año</label>
            <select
              value={anioSeleccionado}
              onChange={(e) => setAnioSeleccionado(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface border border-muted rounded-lg text-text text-sm focus:outline-none focus:border-accent transition-colors duration-200 cursor-pointer"
            >
              <option value="">Seleccione el año</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <button
            type="button"
            onClick={handleBuscar}
            className="flex items-center gap-2 px-8 py-2.5 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/80 transition-colors duration-200 cursor-pointer"
          >
            <Search size={16} />
            Buscar
          </button>
        </div>

        {/* Estado: sin búsqueda */}
        {activeTab === "mensual" && !hasSearched && (
          <div className="flex flex-col items-center justify-center py-16 text-text-muted">
            <BarChart3 size={48} className="mb-4 opacity-40" />
            <p className="text-sm">Seleccione un mes y año para ver las métricas</p>
          </div>
        )}
        {activeTab === "global" && !hasSearched && (
          <div className="flex flex-col items-center justify-center py-16 text-text-muted">
            <BarChart3 size={48} className="mb-4 opacity-40" />
            <p className="text-sm">Seleccione un año para ver las métricas</p>
          </div>
        )}

        {/* Estado: cargando */}
        {hasSearched && isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-text-muted text-sm">Cargando métricas...</p>
          </div>
        )}

        {/* Estado: error */}
        {hasSearched && !isLoading && error && (
          <div className="bg-danger/10 border border-danger/30 rounded-xl p-4 flex items-center gap-3 mb-6">
            <AlertCircle size={20} className="text-danger shrink-0" />
            <p className="text-danger text-sm">{error}</p>
          </div>
        )}

        {/* Métricas mensuales */}
        {activeTab === "mensual" && !isLoading && !error && metricasMensual && (
          <MetricasMensuales metricas={metricasMensual} />
        )}

        {/* Métricas anuales */}
        {activeTab === "global" && !isLoading && !error && metricasGlobal && (
          <MetricasGlobales metricas={metricasGlobal} />
        )}
      </div>
    </Layout>
  )
}

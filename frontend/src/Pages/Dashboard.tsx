import { useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useDashboard } from "../Hooks/useDashboard"
import { Layout } from "../Components/Global/Layout"
import { MessageSquare, Users, Wrench, Boxes, CalendarClock, BarChart3, Bell, AlertCircle } from "lucide-react"

const MODULOS = [
  { nombre: "Notificaciones", icono: MessageSquare, ruta: "/notifications" },
  { nombre: "Clientes", icono: Users, ruta: "/clients" },
  { nombre: "Servicios", icono: Wrench, ruta: "/services" },
  { nombre: "Inventario", icono: Boxes, ruta: "/inventory" },
  { nombre: "Turnos", icono: CalendarClock, ruta: "/shifts" },
  { nombre: "Métricas", icono: BarChart3, ruta: "/metrics" },
]

export const Dashboard = () => {
  const { user } = useAuth()
  const { resumen, isLoading, error, fetchResumen } = useDashboard()

  useEffect(() => {
    fetchResumen()
  }, [fetchResumen])

  return (
    <Layout>
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-bold text-gradient-primary">
            {user?.nombre} {user?.apellido}
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Bienvenido a ByteMend
          </p>
        </div>

        <div className="mt-3 mb-6 border-b-2 border-muted w-full" />

        {/* Estado: cargando */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-text-muted text-sm">Cargando resumen...</p>
          </div>
        )}

        {/* Estado: error */}
        {!isLoading && error && (
          <div className="bg-danger/10 border border-danger/30 rounded-xl p-4 flex items-center gap-3 mb-6 animate-fade-in-scale">
            <AlertCircle size={20} className="text-danger shrink-0" />
            <p className="text-danger text-sm">{error}</p>
          </div>
        )}

        {/* Contenido principal */}
        {!isLoading && !error && resumen && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4 mb-6">
              <div className="bg-surface border border-muted rounded-xl p-4 lg:p-5 card-glow animate-fade-in-up delay-75">
                <p className="text-text-muted text-base mb-2 text-center">Turnos activos</p>
                <p className="text-3xl lg:text-4xl font-bold text-primary text-center">{resumen.turnos_activos}</p>
              </div>
              <div className="bg-surface border border-muted rounded-xl p-4 lg:p-5 card-glow animate-fade-in-up delay-150">
                <p className="text-text-muted text-base mb-2 text-center">Dinero ganado (mes)</p>
                <p className="text-3xl lg:text-4xl font-bold text-success text-center">${resumen.dinero_ganado_mes.toLocaleString("es-AR")}</p>
              </div>
              <div className="bg-surface border border-muted rounded-xl p-4 lg:p-5 card-glow animate-fade-in-up delay-225">
                <p className="text-text-muted text-base mb-2 text-center">Ticket promedio</p>
                <p className="text-3xl lg:text-4xl font-bold text-primary text-center">${resumen.ticket_promedio.toLocaleString("es-AR")}</p>
              </div>
            </div>

            {/* Alerta notificaciones */}
            {resumen.notificaciones_sin_leer > 0 && (
              <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 animate-fade-in-up delay-300">
                <div className="flex items-center gap-3">
                  <Bell size={20} className="text-accent shrink-0 animate-pulse-glow" />
                  <p className="text-text text-sm">
                    Tienes <span className="font-bold">{resumen.notificaciones_sin_leer}</span> {resumen.notificaciones_sin_leer === 1 ? "notificación sin leer" : "notificaciones sin leer"}
                  </p>
                </div>
                <Link
                  to="/notifications"
                  className="flex items-center gap-2 px-5 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/80 transition-all duration-200 shrink-0 card-glow-accent"
                >
                  Ver notificaciones
                </Link>
              </div>
            )}

            {/* Accesos rápidos */}
            <h2 className="text-text-muted text-sm mb-3 animate-fade-in-up delay-375">Accesos rápidos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:gap-4 animate-fade-in-up delay-375">
              {MODULOS.map((mod) => (
                <Link
                  key={mod.ruta}
                  to={mod.ruta}
                  className="bg-surface border border-muted rounded-xl p-5 flex flex-col items-center gap-3 hover:border-accent/50 hover:bg-accent/5 transition-all duration-200 group card-glow"
                >
                  <mod.icono size={28} className="text-text-muted group-hover:text-accent transition-all duration-200 group-hover:scale-110" />
                  <span className="text-text text-sm font-medium group-hover:text-accent transition-colors duration-200">{mod.nombre}</span>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}

import { Layout } from "../Components/Global/Layout"
import { NotificationCard } from "../Components/Notificaciones/NotificationCard"
import { useNotifications } from "../Hooks/useNotifications"
import { MessageSquare, AlertCircle } from "lucide-react"

export const Notificaciones = () => {
  const { noLeidas, leidas, isLoading, error, fetchNotifications, markAsRead } = useNotifications()

  return (
    <Layout>
      <div className="w-full max-w-6xl">
        <h1 className="text-3xl font-bold text-primary text-center">
          Notificaciones
        </h1>
        <div className="mt-2 mb-8 border-b-2 border-muted w-full" />

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-text-muted text-sm">Cargando notificaciones...</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-danger/10 border border-danger/30 mb-6">
            <AlertCircle size={20} className="text-danger shrink-0" />
            <div className="flex-1">
              <p className="text-danger text-sm font-medium">Error al cargar notificaciones</p>
              <p className="text-text-muted text-xs mt-1">{error}</p>
            </div>
            <button
              type="button"
              onClick={fetchNotifications}
              className="text-danger hover:text-danger/80 text-xs font-medium underline cursor-pointer shrink-0"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Contenido */}
        {!isLoading && !error && (
          <>
            {/* Sección No leídas */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare size={20} className="text-success" />
                <h2 className="text-xl font-bold text-text">No leídas</h2>
              </div>
              <span className="text-text-muted text-sm font-medium">{noLeidas.length}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {noLeidas.map((notif) => (
                <NotificationCard
                  key={notif.consulta_id}
                  notification={notif}
                  onMarkAsRead={markAsRead}
                />
              ))}
            </div>

            {/* Sección Leídas */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare size={20} className="text-text-muted" />
                <h2 className="text-xl font-bold text-text">Leídas</h2>
              </div>
              <span className="text-text-muted text-sm font-medium">{leidas.length}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {leidas.map((notif) => (
                <NotificationCard
                  key={notif.consulta_id}
                  notification={notif}
                  onMarkAsRead={markAsRead}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}


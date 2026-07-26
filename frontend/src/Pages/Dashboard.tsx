import { useState, useEffect, useRef } from "react"
import { Menu, X, ChevronDown, LogOut } from "lucide-react"
import { useAuth } from "../context/AuthContext"

export const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const { user, logout } = useAuth()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* === HEADER === */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-muted bg-surface">
        {/* Lado izquierdo: hamburguesa */}
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="text-text hover:text-primary transition-colors duration-200 cursor-pointer"
        >
          <Menu size={24} />
        </button>

        {/* Lado derecho: perfil de usuario */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 text-text hover:text-primary transition-colors duration-200 cursor-pointer"
          >
            <span className="text-sm font-medium">{user?.nombre} {user?.apellido}</span>
            <ChevronDown size={16} className={`transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Menú flotante */}
          {isUserMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-muted rounded-lg shadow-2xl z-50 overflow-hidden">
              <button
                type="button"
                onClick={() => { setIsUserMenuOpen(false); logout() }}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-danger hover:bg-danger/10 transition-colors duration-200 cursor-pointer"
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </header>

      {/* === SIDEBAR === */}
      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Panel lateral */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-surface border-r border-muted transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Botón cerrar */}
        <div className="flex items-center justify-end px-4 py-4 border-b border-muted">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="text-text-muted hover:text-danger transition-colors duration-200 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Título centrado */}
        <div className="flex items-center justify-center mt-4 px-4">
          <h2 className="text-primary text-sm font-bold tracking-wide text-center">
            ByteMend - Menú de navegación
          </h2>
        </div>
      </aside>

      {/* === CONTENIDO PRINCIPAL === */}
      <main className="flex-1 p-6">
        <div className="max-w-4xl">
          <h1 className="text-primary text-3xl font-bold mb-2">
            {user?.nombre} {user?.apellido}
          </h1>
          <p className="text-text-muted text-lg">
            Bienvenido a ByteMend
          </p>
        </div>
      </main>
    </div>
  )
}

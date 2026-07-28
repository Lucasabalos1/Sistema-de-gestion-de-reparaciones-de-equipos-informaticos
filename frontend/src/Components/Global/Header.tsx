import { useState, useEffect, useRef } from "react"
import { Menu, ChevronDown, LogOut } from "lucide-react"
import { useAuth } from "../../context/AuthContext"

interface HeaderProps {
  onToggleSidebar: () => void
}

export const Header = ({ onToggleSidebar }: HeaderProps) => {
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
    <header className="flex items-center justify-between px-4 py-3 border-b border-muted bg-surface">
      {/* Lado izquierdo: hamburguesa */}
      <button
        type="button"
        onClick={onToggleSidebar}
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
  )
}

import { useState, useEffect, useRef } from "react"
import { Menu, ChevronDown, LogOut, Wrench } from "lucide-react"
import { useAuth } from "../../context/AuthContext"

interface HeaderProps {
  onToggleSidebar: () => void
}

export const Header = ({ onToggleSidebar }: HeaderProps) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const { user, logout } = useAuth()

  const iniciales = user
    ? `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`.toUpperCase()
    : "?"

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
    <header className="flex items-center justify-between gap-4 px-4 lg:px-6 py-3 border-b border-muted bg-surface">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-lg text-text hover:text-primary hover:bg-muted/30 transition-colors duration-200 cursor-pointer"
        >
          <Menu size={22} />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
            <Wrench size={18} className="text-accent" />
          </div>
          <div className="leading-tight">
            <p className="text-text font-bold text-base tracking-wide">ByteMend</p>
            <p className="text-text-muted text-[11px] hidden sm:block">Gestión de reparaciones</p>
          </div>
        </div>
      </div>

      <div className="relative" ref={userMenuRef}>
        <button
          type="button"
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className="flex items-center gap-2.5 pl-1 pr-2 py-1.5 rounded-lg hover:bg-muted/30 transition-colors duration-200 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full bg-accent text-white text-sm font-semibold flex items-center justify-center select-none">
            {iniciales}
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <p className="text-text text-sm font-medium">{user?.nombre} {user?.apellido}</p>
            <p className="text-text-muted text-[11px]">@{user?.usuario}</p>
          </div>
          <ChevronDown size={16} className={`text-text-muted transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`} />
        </button>

        {isUserMenuOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-muted rounded-lg shadow-2xl z-50 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-muted">
              <div className="w-9 h-9 rounded-full bg-accent/20 text-accent text-sm font-semibold flex items-center justify-center select-none">
                {iniciales}
              </div>
              <div className="text-left leading-tight">
                <p className="text-text text-sm font-medium">{user?.nombre} {user?.apellido}</p>
                <p className="text-text-muted text-xs">@{user?.usuario}</p>
              </div>
            </div>
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
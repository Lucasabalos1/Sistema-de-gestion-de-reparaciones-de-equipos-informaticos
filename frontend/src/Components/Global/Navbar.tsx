import { Link } from "react-router-dom"
import { X, MessageSquare, Users } from "lucide-react"

interface NavbarProps {
  isOpen: boolean
  onClose: () => void
}

export const Navbar = ({ isOpen, onClose }: NavbarProps) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={onClose}
        />
      )}

      {/* Panel lateral */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-surface border-r border-muted transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Botón cerrar */}
        <div className="flex items-center justify-end px-4 py-4 border-b border-muted">
          <button
            type="button"
            onClick={onClose}
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

        {/* Links de navegación */}
        <nav className="mt-6 px-4 space-y-1">
          <Link
            to="/notifications"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-text hover:bg-accent/10 hover:text-accent transition-colors duration-200"
          >
            <MessageSquare size={20} />
            <span className="text-sm font-medium">Notificaciones</span>
          </Link>
          <Link
            to="/clients"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-text hover:bg-accent/10 hover:text-accent transition-colors duration-200"
          >
            <Users size={20} />
            <span className="text-sm font-medium">Clientes</span>
          </Link>
        </nav>
      </aside>
    </>
  )
}

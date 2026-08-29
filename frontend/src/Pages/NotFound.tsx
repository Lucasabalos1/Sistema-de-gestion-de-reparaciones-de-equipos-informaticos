import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Home, ArrowLeft } from "lucide-react"

export const NotFound = () => {
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()

    const goHome = () => navigate(isAuthenticated ? "/home" : "/login")

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
            <h1 className="text-8xl font-bold text-primary select-none">404</h1>
            <p className="text-text text-xl font-medium mt-4">Página no encontrada</p>
            <p className="text-text-muted text-sm mt-2 max-w-md">
                La ruta que estás buscando no existe o fue movida.
            </p>
            <div className="flex items-center gap-3 mt-8">
                <button
                    type="button"
                    onClick={goHome}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/80 transition-colors duration-200 cursor-pointer"
                >
                    <Home size={18} />
                    Volver al inicio
                </button>
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface border border-muted text-text-muted text-sm font-medium hover:text-text hover:border-accent/50 transition-colors duration-200 cursor-pointer"
                >
                    <ArrowLeft size={18} />
                    Ir atrás
                </button>
            </div>
        </div>
    )
}
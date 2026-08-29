import { createContext, useContext, useState, useEffect } from "react"

export interface User {
  admin_id: number
  usuario: string
  nombre: string
  apellido: string
  genero: string
}

export interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, userData: User, refreshToken?: string) => void
  logout: () => void
}

const API_URL = import.meta.env.VITE_API_URL as string

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const storedToken = localStorage.getItem("bytemend_token")
    const storedUser = localStorage.getItem("bytemend_user")
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User
        setToken(storedToken)
        setUser(parsedUser)
      } catch {
        localStorage.removeItem("bytemend_token")
        localStorage.removeItem("bytemend_refresh_token")
        localStorage.removeItem("bytemend_user")
      }
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    const handleSessionExpired = () => {
      setToken(null)
      setUser(null)
      localStorage.removeItem("bytemend_token")
      localStorage.removeItem("bytemend_refresh_token")
      localStorage.removeItem("bytemend_user")
    }
    window.addEventListener("bytemend:session-expired", handleSessionExpired)
    return () => window.removeEventListener("bytemend:session-expired", handleSessionExpired)
  }, [])

  const login = (newToken: string, userData: User, refreshToken?: string) => {
    setToken(newToken)
    setUser(userData)
    localStorage.setItem("bytemend_token", newToken)
    localStorage.setItem("bytemend_user", JSON.stringify(userData))
    if (refreshToken) {
      localStorage.setItem("bytemend_refresh_token", refreshToken)
    }
  }

  const logout = () => {
    const currentToken = localStorage.getItem("bytemend_token")
    if (currentToken) {
      fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${currentToken}` },
      }).catch(() => {})
    }
    setToken(null)
    setUser(null)
    localStorage.removeItem("bytemend_token")
    localStorage.removeItem("bytemend_refresh_token")
    localStorage.removeItem("bytemend_user")
  }

  const isAuthenticated = token !== null

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}

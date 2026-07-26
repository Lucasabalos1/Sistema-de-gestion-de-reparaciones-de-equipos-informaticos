import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (usuario: string, contraseña: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, contraseña }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Credenciales inválidas")
        return
      }

      login(data.token, data.usuario)
      navigate("/home")
    } catch {
      setError("Error de conexión con el servidor")
    } finally {
      setIsLoading(false)
    }
  }

  return { handleLogin, isLoading, error }
}

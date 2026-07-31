import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useFetch } from "./useFetch"
import type { User } from "../context/AuthContext"

interface LoginResponse {
    token: string
    usuario: User
}

const API_URL = import.meta.env.VITE_API_URL as string

export const useLogin = () => {
    const { login } = useAuth()
    const navigate = useNavigate()
    const { post, isLoading, error } = useFetch<LoginResponse, { usuario: string; contraseña: string }>(API_URL)

    const handleLogin = async (usuario: string, contraseña: string) => {
        const data = await post("/auth/login", { usuario, contraseña })
        if (data) {
            login(data.token, data.usuario)
            navigate("/home")
        }
    }

    return { handleLogin, isLoading, error }
}

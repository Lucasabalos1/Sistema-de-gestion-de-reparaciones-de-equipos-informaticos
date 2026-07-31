import { useState, useCallback } from "react"
import { useFetch } from "./useFetch"
import { useAuth } from "../context/AuthContext"
import type { Cliente, ClienteFormData } from "../Types/Cliente"

const API_URL = import.meta.env.VITE_API_URL as string

export const useClientes = () => {
  const { user } = useAuth()
  const { get, post, put, delete: deleteFn, isLoading, error } = useFetch<Cliente[], ClienteFormData>(
    `${API_URL}/clientes`
  )
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)

  const fetchClientes = useCallback(async () => {
    const data = await get("/")
    if (data) {
      setClientes(data)
    }
  }, [get])

  const searchCliente = useCallback(async (telefono: string) => {
    const data = await get<Cliente>(`/${encodeURIComponent(telefono)}`)
    if (data) {
      setSelectedCliente(data)
      setClientes([data])
    }
    return data
  }, [get])

  const createCliente = useCallback(async (formData: ClienteFormData) => {
    if (!user) return null
    const data = await post<{ message: string }>("/", {
      ...formData,
      admin_id: user.admin_id,
    } as ClienteFormData & { admin_id: number })
    if (data) {
      await fetchClientes()
    }
    return data
  }, [post, user, fetchClientes])

  const updateCliente = useCallback(async (id: number, formData: ClienteFormData) => {
    if (!user) return null
    const data = await put<{ message: string }>("", id, {
      ...formData,
      admin_id: user.admin_id,
    } as ClienteFormData & { admin_id: number })
    if (data) {
      await fetchClientes()
    }
    return data
  }, [put, user, fetchClientes])

  const deleteCliente = useCallback(async (id: number) => {
    const success = await deleteFn("", id)
    if (success) {
      setClientes((prev) => prev.filter((c) => c.cliente_id !== id))
    }
    return success
  }, [deleteFn])

  return {
    clientes,
    selectedCliente,
    setSelectedCliente,
    isLoading,
    error,
    fetchClientes,
    searchCliente,
    createCliente,
    updateCliente,
    deleteCliente,
  }
}

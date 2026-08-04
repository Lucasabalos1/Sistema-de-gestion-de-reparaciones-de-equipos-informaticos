import { useState, useCallback, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useFetch } from "./useFetch"
import type { Inventario, InventarioFormData } from "../Types/Inventory"

const API_URL = import.meta.env.VITE_API_URL as string

export const useInventario = () => {
  const { user } = useAuth()
  const { get, post, put, upload, isLoading, error } = useFetch<Inventario[], InventarioFormData>(
    `${API_URL}/inventario`
  )
  const [inventario, setInventario] = useState<Inventario[]>([])

  const adminId = user?.admin_id

  const fetchInventario = useCallback(async () => {
    const data = await get("/")
    if (data) {
      setInventario(data)
    }
  }, [get])

  const searchInventario = useCallback(async (nombre: string) => {
    const data = await get<Inventario[]>(`/${encodeURIComponent(nombre)}`)
    if (data) {
      setInventario(data)
    }
    return data
  }, [get])

  const createInventario = useCallback(async (formData: Omit<InventarioFormData, "admin_id">) => {
    if (!adminId) return null
    const data = await post<{ message: string }>("/", { ...formData, admin_id: adminId })
    if (data) {
      await fetchInventario()
    }
    return data
  }, [post, fetchInventario, adminId])

  const updateInventario = useCallback(async (id: number, formData: Omit<InventarioFormData, "admin_id">) => {
    if (!adminId) return null
    const data = await put<{ message: string }>("", id, { ...formData, admin_id: adminId })
    if (data) {
      await fetchInventario()
    }
    return data
  }, [put, fetchInventario, adminId])

  const importarCsv = useCallback(async (archivo: File) => {
    const formData = new FormData()
    formData.append("archivo", archivo)
    const data = await upload<{ message: string }>("/csv", formData)
    if (data) {
      await fetchInventario()
    }
    return data
  }, [upload, fetchInventario])

  useEffect(() => {
    fetchInventario()
  }, [fetchInventario])

  useEffect(() => {
    if (error === "No hay repuestos en el inventario" || error === "No se encontraron repuestos con ese nombre.") {
      setInventario([])
    }
  }, [error])

  return {
    inventario,
    isLoading,
    error,
    fetchInventario,
    searchInventario,
    createInventario,
    updateInventario,
    importarCsv,
  }
}

import { useState, useCallback, useEffect } from "react"
import { useFetch } from "./useFetch"
import type { Servicio, ServicioFormData } from "../Types/Servicio"

const API_URL = import.meta.env.VITE_API_URL as string

export const useServicios = () => {
  const { get, post, put, isLoading, error } = useFetch<Servicio[], ServicioFormData>(
    `${API_URL}/servicios`
  )
  const [servicios, setServicios] = useState<Servicio[]>([])

  const fetchServicios = useCallback(async () => {
    const data = await get("/")
    if (data) {
      setServicios(data)
    }
  }, [get])

  const searchServicio = useCallback(async (nombre: string) => {
    const data = await get<Servicio[]>(`/${encodeURIComponent(nombre)}`)
    if (data) {
      setServicios(data)
    }
    return data
  }, [get])

  const createServicio = useCallback(async (formData: ServicioFormData) => {
    const data = await post<{ message: string }>("/", formData)
    if (data) {
      await fetchServicios()
    }
    return data
  }, [post, fetchServicios])

  const updateServicio = useCallback(async (id: number, formData: ServicioFormData) => {
    const data = await put<{ message: string }>("", id, formData)
    if (data) {
      await fetchServicios()
    }
    return data
  }, [put, fetchServicios])

  useEffect(() => {
    fetchServicios()
  }, [fetchServicios])

  useEffect(() => {
    if (error === "No hay servicios registrados" || error === "No se encontraron servicios con ese nombre.") {
      setServicios([])
    }
  }, [error])

  return {
    servicios,
    isLoading,
    error,
    fetchServicios,
    searchServicio,
    createServicio,
    updateServicio,
  }
}

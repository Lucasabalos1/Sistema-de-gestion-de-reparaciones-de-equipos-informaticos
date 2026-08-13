import { useState, useCallback } from "react"
import { useFetch } from "./useFetch"
import type { Turno, TurnoFormData, TurnosKanban, EstadoTecnico, EstadoComercial } from "../Types/Turno"

const API_URL = import.meta.env.VITE_API_URL as string

const EMPTY_KANBAN: TurnosKanban = {
  "En espera": [],
  "Reparando": [],
  "En espera de stock": [],
  "Reparado": [],
  "Sin solución": [],
}

interface MessageResponse {
  message: string
}

export const useTurnos = () => {
  const { get, post, put, patch, isLoading, error } = useFetch<TurnosKanban, TurnoFormData>(
    `${API_URL}/turnos`
  )
  const [kanban, setKanban] = useState<TurnosKanban>(EMPTY_KANBAN)
  const [historial, setHistorial] = useState<Turno[]>([])

  const fetchTurnos = useCallback(async () => {
    const data = await get<Partial<TurnosKanban>>("/")
    if (data) {
      setKanban({ ...EMPTY_KANBAN, ...data })
    }
  }, [get])

  const fetchHistorial = useCallback(async () => {
    const data = await get<Turno[]>("/historial")
    if (data) {
      setHistorial(data)
    } else {
      setHistorial([])
    }
  }, [get])

  const refresh = useCallback(async () => {
    await Promise.all([fetchTurnos(), fetchHistorial()])
  }, [fetchTurnos, fetchHistorial])

  const crearTurno = useCallback(async (formData: TurnoFormData) => {
    const data = await post<MessageResponse>("/", formData)
    if (data) {
      await refresh()
    }
    return data
  }, [post, refresh])

  const editarTurno = useCallback(async (id: number, formData: TurnoFormData) => {
    const data = await put<MessageResponse>("", id, formData)
    if (data) {
      await refresh()
    }
    return data
  }, [put, refresh])

  const cambiarEstadoTecnico = useCallback(async (id: number, estadoTecnico: EstadoTecnico) => {
    const data = await patch<MessageResponse>(`/${id}/estado-tecnico`, { estado_tecnico: estadoTecnico })
    if (data) {
      await refresh()
    }
    return data
  }, [patch, refresh])

  const cambiarEstadoComercial = useCallback(async (id: number, estadoComercial: EstadoComercial) => {
    const data = await patch<MessageResponse>(`/${id}/estado-comercial`, { estado_comercial: estadoComercial })
    if (data) {
      await refresh()
    }
    return data
  }, [patch, refresh])

  const cancelarTurno = useCallback(async (id: number) => {
    const data = await patch<MessageResponse>(`/${id}/cancelar`)
    if (data) {
      await refresh()
    }
    return data
  }, [patch, refresh])

  return {
    kanban,
    historial,
    isLoading,
    error,
    fetchTurnos,
    fetchHistorial,
    refresh,
    crearTurno,
    editarTurno,
    cambiarEstadoTecnico,
    cambiarEstadoComercial,
    cancelarTurno,
  }
}

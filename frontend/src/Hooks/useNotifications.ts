import { useState, useEffect, useCallback, useRef } from "react"
import { useFetch } from "./useFetch"
import type { Notification, NotificationResponse } from "../Types/notificacion"

const API_URL = import.meta.env.VITE_API_URL as string

export const useNotifications = () => {
  const [noLeidas, setNoLeidas] = useState<Notification[]>([])
  const [leidas, setLeidas] = useState<Notification[]>([])
  const noLeidasRef = useRef(noLeidas)
  noLeidasRef.current = noLeidas
  const { get, patch, isLoading, error } = useFetch<NotificationResponse>(
    `${API_URL}/notificaciones`
  )

  const fetchNotifications = useCallback(async () => {
    const data = await get("/")
    if (data) {
      setNoLeidas(data.no_leidas)
      setLeidas(data.leidas)
    }
  }, [get])

  const markAsRead = useCallback(async (consultaId: number) => {
    const data = await patch(consultaId)
    if (data) {
      const notif = noLeidasRef.current.find((n) => n.consulta_id === consultaId)
      if (notif) {
        setLeidas((prev) => [{ ...notif, leido: true }, ...prev])
      }
      setNoLeidas((prev) => prev.filter((n) => n.consulta_id !== consultaId))
    }
  }, [patch])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return { noLeidas, leidas, isLoading, error, fetchNotifications, markAsRead }
}

import { useState, useCallback } from "react"
import { useFetch } from "./useFetch"
import type { DashboardResumen } from "../Types/Dashboard"

const API_URL = import.meta.env.VITE_API_URL as string

export const useDashboard = () => {
  const { get, isLoading, error } = useFetch<DashboardResumen>(`${API_URL}/dashboard`)

  const [resumen, setResumen] = useState<DashboardResumen | null>(null)

  const fetchResumen = useCallback(async () => {
    const data = await get<DashboardResumen>("/resumen")
    if (data) {
      setResumen(data)
    } else {
      setResumen(null)
    }
  }, [get])

  return {
    resumen,
    isLoading,
    error,
    fetchResumen,
  }
}

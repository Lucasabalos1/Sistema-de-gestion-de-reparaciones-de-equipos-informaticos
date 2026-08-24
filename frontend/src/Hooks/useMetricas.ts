import { useState, useCallback } from "react"
import { useFetch } from "./useFetch"
import type { MetricasMensual, MetricasGlobal, MetricasMensualPayload, MetricasGlobalPayload } from "../Types/Metricas"

const API_URL = import.meta.env.VITE_API_URL as string

export const useMetricas = () => {
  const { post, isLoading, error } = useFetch<MetricasMensual | MetricasGlobal, MetricasMensualPayload | MetricasGlobalPayload>(
    `${API_URL}/metricas`
  )

  const [metricasMensual, setMetricasMensual] = useState<MetricasMensual | null>(null)
  const [metricasGlobal, setMetricasGlobal] = useState<MetricasGlobal | null>(null)

  const fetchMensual = useCallback(async (mes: number, anio: number) => {
    const data = await post<MetricasMensual>("/mensual", { mes, anio })
    if (data) {
      setMetricasMensual(data)
    } else {
      setMetricasMensual(null)
    }
  }, [post])

  const fetchGlobal = useCallback(async (anio?: number) => {
    const data = await post<MetricasGlobal>("/global", { anio })
    if (data) {
      setMetricasGlobal(data)
    } else {
      setMetricasGlobal(null)
    }
  }, [post])

  return {
    metricasMensual,
    metricasGlobal,
    isLoading,
    error,
    fetchMensual,
    fetchGlobal,
  }
}

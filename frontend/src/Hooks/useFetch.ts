import { useState, useCallback } from "react"

interface UseFetchReturn<T, P> {
  isLoading: boolean
  error: string | null
  get: <R = T>(path?: string) => Promise<R | null>
  post: <R = T>(path: string, payload: P) => Promise<R | null>
  put: <R = T>(path: string, id: number | string, payload: Partial<P>) => Promise<R | null>
  patch: <R = T>(id: number | string, payload?: Partial<P>) => Promise<R | null>
  delete: (path: string, id: number | string) => Promise<boolean>
  upload: <R = T>(path: string, formData: FormData) => Promise<R | null>
}

export const useFetch = <T, P = unknown>(baseUrl: string): UseFetchReturn<T, P> => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const getToken = (): string | null => localStorage.getItem("bytemend_token")

  const getAuthHeaders = (): HeadersInit => {
    const token = getToken()
    const headers: HeadersInit = {}
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
    return headers
  }

  const getHeaders = (): HeadersInit => ({
    "Content-Type": "application/json",
    ...getAuthHeaders(),
  })

  const request = useCallback(async <R>(url: string, options: RequestInit): Promise<R | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(url, { ...options, headers: options.headers ?? getHeaders() })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        setError(data?.error || data?.message || `Error ${response.status}`)
        return null
      }

      return await response.json()
    } catch {
      setError("Error de conexión con el servidor")
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const get = useCallback(async <R = T>(path?: string): Promise<R | null> => {
    const url = path ? `${baseUrl}${path}` : baseUrl
    return request<R>(url, { method: "GET" })
  }, [baseUrl, request])

  const post = useCallback(async <R = T>(path: string, payload: P): Promise<R | null> => {
    return request<R>(`${baseUrl}${path}`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }, [baseUrl, request])

  const put = useCallback(async <R = T>(path: string, id: number | string, payload: Partial<P>): Promise<R | null> => {
    return request<R>(`${baseUrl}${path}/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
  }, [baseUrl, request])

  const patch = useCallback(async <R = T>(id: number | string, payload?: Partial<P>): Promise<R | null> => {
    return request<R>(`${baseUrl}/${id}`, {
      method: "PATCH",
      body: payload ? JSON.stringify(payload) : undefined,
    })
  }, [baseUrl, request])

  const deleteFn = useCallback(async (path: string, id: number | string): Promise<boolean> => {
    const result = await request<unknown>(`${baseUrl}${path}/${id}`, { method: "DELETE" })
    return result !== null
  }, [baseUrl, request])

  const upload = useCallback(async <R = T>(path: string, formData: FormData): Promise<R | null> => {
    return request<R>(`${baseUrl}${path}`, {
      method: "POST",
      body: formData,
      headers: getAuthHeaders(),
    })
  }, [baseUrl, request])

  return { isLoading, error, get, post, put, patch, delete: deleteFn, upload }
}

"use client"

import { useState, useCallback } from "react"

interface Toast {
  id: string
  type: "success" | "error" | "loading"
  title: string
  description?: string
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((type: "success" | "error" | "loading", title: string, description?: string) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { id, type, title, description }

    console.log("Adding toast:", newToast);
    setToasts((prev) => {
      const updated = [...prev, newToast];
      console.log("Updated toasts array:", updated);
      return updated;
    })

    // Auto remove toast after 4 seconds (except loading)
    if (type !== "loading") {
      setTimeout(() => {
        removeToast(id)
      }, 4000)
    }

    return id // Retorna el ID para poder cerrar manualmente si es necesario
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showSuccess = useCallback(
    (title: string, description?: string) => {
      console.log("showSuccess called with:", { title, description });
      return addToast("success", title, description)
    },
    [addToast],
  )

  const showError = useCallback(
    (title: string, description?: string) => {
      return addToast("error", title, description)
    },
    [addToast],
  )

  const showLoading = useCallback(
    (title: string, description?: string) => {
      console.log("showLoading called with:", { title, description });
      return addToast("loading", title, description)
    },
    [addToast],
  )

  // Función especial para promesas
  const promiseToast = useCallback(
    async (
      promise: Promise<any>,
      messages: {
        loading: { title: string; description?: string }
        success: { title: string; description?: string }
        error: { title: string; description?: string } | ((error: any) => { title: string; description?: string })
      },
    ) => {
      // Mostrar loading toast
      const loadingId = showLoading(messages.loading.title, messages.loading.description)

      try {
        const result = await promise

        // Remover loading y mostrar success
        removeToast(loadingId)
        showSuccess(messages.success.title, messages.success.description)

        return result
      } catch (error) {
        // Remover loading y mostrar error
        removeToast(loadingId)

        const errorMessage = typeof messages.error === "function" ? messages.error(error) : messages.error

        showError(errorMessage.title, errorMessage.description)

        throw error
      }
    },
    [showLoading, showSuccess, showError, removeToast],
  )

  return {
    toasts,
    showSuccess,
    showError,
    showLoading,
    removeToast,
    promiseToast,
  }
}

"use client"

import { useEffect, useState } from "react"
import { X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LoadingToastProps {
  message: string
  onClose?: () => void
}

const LoadingToast = ({ message, onClose }: LoadingToastProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10)
  }, [])

  const handleClose = () => {
    if (onClose) {
      setIsLeaving(true)
      setTimeout(() => {
        onClose()
      }, 300)
    }
  }

  const getToastStyles = () => {
    const baseStyles =
      "relative overflow-hidden rounded-lg shadow-lg border backdrop-blur-sm transition-all duration-300 ease-out transform bg-blue-50/95 border-blue-200 shadow-blue-100/50"

    if (isLeaving) {
      return `${baseStyles} translate-x-full opacity-0 scale-95`
    }

    if (!isVisible) {
      return `${baseStyles} translate-x-full opacity-0 scale-95`
    }

    return `${baseStyles} translate-x-0 opacity-100 scale-100`
  }

  return (
    <div className={getToastStyles()}>
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pt-1">
            <p className="text-blue-800 font-medium text-lg leading-6">{message}</p>
          </div>
        </div>
      </div>

      {/* Close button */}
      {onClose && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-black/5 rounded-full"
        >
          <X className="w-4 h-4 text-gray-500" />
        </Button>
      )}

      {/* Decorative accent */}
      <div className="absolute left-0 top-0 w-1 h-full bg-blue-500" />
    </div>
  )
}

export default LoadingToast

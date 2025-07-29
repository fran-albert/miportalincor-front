"use client"

import { useEffect, useState } from "react"
import { X, Check, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CustomToastProps {
  type: "success" | "error" | "loading"
  title: string
  description?: string
  onClose: () => void
}

export function CustomToast({ type, title, description, onClose }: CustomToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 10)
  }, [])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const getToastStyles = () => {
    const baseStyles =
      "relative overflow-hidden rounded-lg shadow-lg border backdrop-blur-sm transition-all duration-300 ease-out transform"

    if (isLeaving) {
      return `${baseStyles} translate-x-full opacity-0 scale-95`
    }

    if (!isVisible) {
      return `${baseStyles} translate-x-full opacity-0 scale-95`
    }

    const visibleStyles = `${baseStyles} translate-x-0 opacity-100 scale-100`

    switch (type) {
      case "success":
        return `${visibleStyles} bg-green-50/95 border-green-200 shadow-green-100/50`
      case "error":
        return `${visibleStyles} bg-red-50/95 border-red-200 shadow-red-100/50`
      case "loading":
        return `${visibleStyles} bg-blue-50/95 border-blue-200 shadow-blue-100/50`
      default:
        return visibleStyles
    }
  }

  const getIconAndColors = () => {
    switch (type) {
      case "success":
        return {
          icon: <Check className="w-5 h-5" />,
          iconBg: "bg-green-100",
          iconColor: "text-green-600",
          titleColor: "text-green-800",
          descColor: "text-green-700",
          progressBg: "bg-green-200",
          progressFill: "bg-green-500",
        }
      case "error":
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          iconBg: "bg-red-100",
          iconColor: "text-red-600",
          titleColor: "text-red-800",
          descColor: "text-red-700",
          progressBg: "bg-red-200",
          progressFill: "bg-red-500",
        }
      case "loading":
        return {
          icon: <Loader2 className="w-5 h-5 animate-spin" />,
          iconBg: "bg-blue-100",
          iconColor: "text-blue-600",
          titleColor: "text-blue-800",
          descColor: "text-blue-700",
          progressBg: "bg-blue-200",
          progressFill: "bg-blue-500",
        }
      default:
        return {
          icon: <Check className="w-5 h-5" />,
          iconBg: "bg-gray-100",
          iconColor: "text-gray-600",
          titleColor: "text-gray-800",
          descColor: "text-gray-700",
          progressBg: "bg-gray-200",
          progressFill: "bg-gray-500",
        }
    }
  }

  const { icon, iconBg, iconColor, titleColor, descColor, progressBg, progressFill } = getIconAndColors()

  return (
    <div className={getToastStyles()}>
      {/* Progress bar for auto-close (only for success and error) */}
      {type !== "loading" && (
        <div className={`absolute bottom-0 left-0 h-1 ${progressBg} w-full`}>
          <div
            className={`h-full ${progressFill} transition-all duration-[4000ms] ease-linear ${isVisible ? "w-0" : "w-full"}`}
          />
        </div>
      )}

      <div className="p-4 pr-12">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full ${iconBg} flex items-center justify-center ${iconColor}`}>
            {icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-semibold ${titleColor} leading-5`}>{title}</h4>
            {description && <p className={`text-sm ${descColor} mt-1 leading-5`}>{description}</p>}
          </div>
        </div>
      </div>

      {/* Close button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClose}
        className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-black/5 rounded-full"
      >
        <X className="w-4 h-4 text-gray-500" />
      </Button>

      {/* Decorative accent */}
      <div className={`absolute left-0 top-0 w-1 h-full ${progressFill}`} />
    </div>
  )
}

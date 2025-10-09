"use client";
import { useEffect, useState } from "react";
import { X, Check, AlertCircle, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
interface CustomToastProps {
  type: "success" | "error" | "loading" | "warning";
  title: string;
  description?: string;
  onClose: () => void;
}
export function CustomToast({
  type,
  title,
  description,
  onClose,
}: CustomToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 10);
  }, []);
  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };
  const getToastStyles = () => {
    const { bgColor, borderColor, shadowColor } = getIconAndColors();
    const baseStyles = `relative overflow-hidden rounded-xl shadow-2xl border-2 backdrop-blur-sm
      transition-all duration-300 ease-out transform ${bgColor} ${borderColor} ${shadowColor}`;
    if (isLeaving) {
      return `${baseStyles} translate-x-full opacity-0 scale-90`;
    }
    if (!isVisible) {
      return `${baseStyles} translate-x-full opacity-0 scale-95`;
    }
    return `${baseStyles} translate-x-0 opacity-100 scale-100`;
  };
  const getIconAndColors = () => {
    switch (type) {
      case "success":
        return {
          icon: <Check className="w-5 h-5" />,
          iconBg: "bg-gradient-to-br from-green-500 to-emerald-600",
          iconColor: "text-white",
          titleColor: "text-gray-900",
          descColor: "text-gray-700",
          borderColor: "border-green-500",
          bgColor: "bg-white",
          accentGradient: "bg-gradient-to-b from-green-500 to-emerald-600",
          shadowColor: "shadow-green-500/20",
        };
      case "error":
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          iconBg: "bg-gradient-to-br from-red-500 to-rose-600",
          iconColor: "text-white",
          titleColor: "text-gray-900",
          descColor: "text-gray-700",
          borderColor: "border-red-500",
          bgColor: "bg-white",
          accentGradient: "bg-gradient-to-b from-red-500 to-rose-600",
          shadowColor: "shadow-red-500/20",
        };
      case "loading":
        return {
          icon: <Loader2 className="w-5 h-5 animate-spin" />,
          iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
          iconColor: "text-white",
          titleColor: "text-gray-900",
          descColor: "text-gray-700",
          borderColor: "border-blue-500",
          bgColor: "bg-white",
          accentGradient: "bg-gradient-to-b from-blue-500 to-indigo-600",
          shadowColor: "shadow-blue-500/20",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          iconBg: "bg-gradient-to-br from-yellow-500 to-orange-600",
          iconColor: "text-white",
          titleColor: "text-gray-900",
          descColor: "text-gray-700",
          borderColor: "border-yellow-500",
          bgColor: "bg-white",
          accentGradient: "bg-gradient-to-b from-yellow-500 to-orange-600",
          shadowColor: "shadow-yellow-500/20",
        };
      default:
        return {
          icon: <Check className="w-5 h-5" />,
          iconBg: "bg-gradient-to-br from-gray-500 to-gray-600",
          iconColor: "text-white",
          titleColor: "text-gray-900",
          descColor: "text-gray-700",
          borderColor: "border-gray-500",
          bgColor: "bg-white",
          accentGradient: "bg-gradient-to-b from-gray-500 to-gray-600",
          shadowColor: "shadow-gray-500/20",
        };
    }
  };
  const { icon, iconBg, iconColor, titleColor, descColor, accentGradient } =
    getIconAndColors();
  return (
    <div className={getToastStyles()}>
      {/* Progress bar for auto-close (only for success and error) */}
      {type !== "loading" && (
        <div className="absolute bottom-0 left-0 h-1.5 bg-gray-100 w-full">
          <div
            className={`h-full ${accentGradient} transition-all duration-[4000ms] ease-linear{isVisible ? "w-0" : "w-full"}`}
          />
        </div>
      )}
      <div className="p-4 pr-12">
        <div className="flex items-start gap-3">
          {/* Icon with gradient */}
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-full ${iconBg} flex items-centerustify-center ${iconColor} shadow-lg`}
          >
            {icon}
          </div>
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-semibold ${titleColor} leading-5`}>
              {title}
            </h4>
            {description && (
              <p className={`text-sm ${descColor} mt-1 leading-5`}>
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
      {/* Close button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClose}
        className="absolute top-3 right-3 h-7 w-7 p-0 hover:bg-gray-100 rounded-fullransition-colors"
      >
        <X className="w-4 h-4 text-gray-600" />
      </Button>
      {/* Decorative accent with gradient */}
      <div
        className={`absolute left-0 top-0 w-1.5 h-full ${accentGradient} rounded-l-xl`}
      />
    </div>
  );
}

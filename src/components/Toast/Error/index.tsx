"use client";

import { useEffect, useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorToastProps {
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
}

const ErrorToast = ({
  message,
  onClose,
  autoClose = true,
}: ErrorToastProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);

    // Auto close after 4 seconds
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  const handleClose = () => {
    if (onClose) {
      setIsLeaving(true);
      setTimeout(() => {
        onClose();
      }, 300);
    }
  };

  const getToastStyles = () => {
    const baseStyles =
      "relative overflow-hidden rounded-lg shadow-lg border backdrop-blur-sm transition-all duration-300 ease-out transform bg-red-50/95 border-red-200 shadow-red-100/50";

    if (isLeaving) {
      return `${baseStyles} translate-x-full opacity-0 scale-95`;
    }

    if (!isVisible) {
      return `${baseStyles} translate-x-full opacity-0 scale-95`;
    }

    return `${baseStyles} translate-x-0 opacity-100 scale-100`;
  };

  return (
    <div className={getToastStyles()}>
      {/* Progress bar for auto-close */}
      {autoClose && (
        <div className="absolute bottom-0 left-0 h-1 bg-red-200 w-full">
          <div
            className={`h-full bg-red-500 transition-all duration-[4000ms] ease-linear ${
              isVisible ? "w-0" : "w-full"
            }`}
          />
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <AlertCircle className="w-6 h-6" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pt-1">
            <p className="text-red-800 font-medium text-lg leading-6">
              {message}
            </p>
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
      <div className="absolute left-0 top-0 w-1 h-full bg-red-500" />
    </div>
  );
};

export default ErrorToast;

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface LoadingOverlayProps {
  isGenerating: boolean;
  progress: number;
  onCancel?: () => void;
  statusMessage?: string;
}

export default function PdfLoadingOverlay({
  isGenerating,
  progress,
  onCancel,
  statusMessage,
}: LoadingOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isGenerating) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isGenerating]);

  if (!isVisible) return null;

  const status = statusMessage || (progress < 100 ? "Procesando..." : "Completado");

  return (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 ${
        isGenerating ? "opacity-100" : "opacity-0"
      }`}
      aria-modal="true"
      role="dialog"
      aria-labelledby="pdf-progress-title"
    >
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md mx-4 relative">
        {onCancel && (
          <button
            onClick={onCancel}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            aria-label="Cancelar"
          >
            <X size={20} />
          </button>
        )}

        <h3
          id="pdf-progress-title"
          className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-100"
        >
          {status}...
        </h3>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-6 overflow-hidden">
          <div
            className="bg-greenPrimary h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            {status}
          </p>
          <p className="text-greenPrimary font-bold">
            {progress}%
          </p>
        </div>
      </div>
    </div>
  );
}

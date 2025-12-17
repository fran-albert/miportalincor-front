"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useToast } from "./useToast";
import { ToastContainer } from "@/components/Toast/Container/toast-container";
import { ApiError } from "@/types/Error/ApiError";

// Evento global para mostrar toasts desde fuera de React (ej: interceptores de axios)
export const TOAST_EVENT = "app:toast";
export interface ToastEventDetail {
  type: "success" | "error";
  title: string;
  description?: string;
}

interface Toast {
  id: string;
  type: "success" | "error" | "loading";
  title: string;
  description?: string;
}

interface ToastContextType {
  toasts: Toast[];
  showSuccess: (title: string, description?: string) => string;
  showError: (title: string, description?: string) => string;
  showLoading: (title: string, description?: string) => string;
  removeToast: (id: string) => void;
  promiseToast: <T = unknown>(
    promise: Promise<T>,
    messages: {
      loading: { title: string; description?: string };
      success: { title: string; description?: string };
      error:
        | { title: string; description?: string }
        | ((error: ApiError) => { title: string; description?: string });
    }
  ) => Promise<T>;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const toast = useToast();

  // Escuchar eventos de toast desde fuera de React (ej: interceptores de axios)
  useEffect(() => {
    const handleToastEvent = (event: CustomEvent<ToastEventDetail>) => {
      const { type, title, description } = event.detail;
      if (type === "success") {
        toast.showSuccess(title, description);
      } else if (type === "error") {
        toast.showError(title, description);
      }
    };

    window.addEventListener(TOAST_EVENT, handleToastEvent as EventListener);
    return () => {
      window.removeEventListener(TOAST_EVENT, handleToastEvent as EventListener);
    };
  }, [toast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToastContext() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
}

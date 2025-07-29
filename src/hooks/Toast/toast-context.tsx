"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useToast } from "./useToast";
import { ToastContainer } from "@/components/Toast/Container/toast-container";

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
  promiseToast: (
    promise: Promise<any>,
    messages: {
      loading: { title: string; description?: string };
      success: { title: string; description?: string };
      error:
        | { title: string; description?: string }
        | ((error: any) => { title: string; description?: string });
    }
  ) => Promise<any>;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
}

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { createElement, type ReactNode } from "react";

// --- Mocks ---

const mockGetOperatorPendingCount = vi.hoisted(() => vi.fn());
const mockToastInfo = vi.hoisted(() => vi.fn());
const mockInvalidateQueries = vi.hoisted(() => vi.fn());

vi.mock("@/api/Prescription-Request", () => ({
  getOperatorPendingCount: mockGetOperatorPendingCount,
}));

vi.mock("sonner", () => ({
  toast: {
    info: mockToastInfo,
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import {
  useOperatorPrescriptionNotifications,
  operatorPrescriptionNotificationKeys,
} from "../useOperatorPrescriptionNotifications";

// --- Helpers ---

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        // Desactivar polling en tests
        refetchInterval: false,
      },
    },
  });
  // Mock invalidateQueries en el queryClient
  queryClient.invalidateQueries = mockInvalidateQueries;

  return ({ children }: { children: ReactNode }) =>
    createElement(
      MemoryRouter,
      null,
      createElement(QueryClientProvider, { client: queryClient }, children)
    );
};

// --- Tests ---

describe("useOperatorPrescriptionNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetOperatorPendingCount.mockResolvedValue({ count: 0 });
  });

  it("debe retornar pendingCount 0 cuando la API retorna 0", async () => {
    mockGetOperatorPendingCount.mockResolvedValue({ count: 0 });

    const { result } = renderHook(
      () => useOperatorPrescriptionNotifications(),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.pendingCount).toBe(0);
    expect(result.current.hasPendingRequests).toBe(false);
  });

  it("debe retornar el count correcto cuando hay pendientes", async () => {
    mockGetOperatorPendingCount.mockResolvedValue({ count: 7 });

    const { result } = renderHook(
      () => useOperatorPrescriptionNotifications(),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.pendingCount).toBe(7);
    });

    expect(result.current.hasPendingRequests).toBe(true);
  });

  it("debe estar en isLoading=true mientras carga", () => {
    // No resolvemos la promesa todavía
    mockGetOperatorPendingCount.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(
      () => useOperatorPrescriptionNotifications(),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
  });

  it("debe respetar enabled=false", async () => {
    const { result } = renderHook(
      () => useOperatorPrescriptionNotifications({ enabled: false }),
      { wrapper: createWrapper() }
    );

    // Esperar un tick
    await new Promise((r) => setTimeout(r, 50));

    expect(mockGetOperatorPendingCount).not.toHaveBeenCalled();
    expect(result.current.pendingCount).toBe(0);
    expect(result.current.isLoading).toBe(false);
  });

  it("no debe mostrar toast en el primer render (primera lectura del count)", async () => {
    mockGetOperatorPendingCount.mockResolvedValue({ count: 3 });

    renderHook(() => useOperatorPrescriptionNotifications({ showToasts: true }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockGetOperatorPendingCount).toHaveBeenCalled();
    });

    // En el primer render no debe mostrar toast (solo guarda el count como referencia)
    expect(mockToastInfo).not.toHaveBeenCalled();
  });

  it("debe exponer error cuando la query falla", async () => {
    const apiError = new Error("Error de conexión");
    mockGetOperatorPendingCount.mockRejectedValue(apiError);

    const { result } = renderHook(
      () => useOperatorPrescriptionNotifications(),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.pendingCount).toBe(0);
  });
});

// --- Tests: operatorPrescriptionNotificationKeys ---

describe("operatorPrescriptionNotificationKeys", () => {
  it("debe tener la query key correcta para pendingCount", () => {
    expect(operatorPrescriptionNotificationKeys.pendingCount).toEqual([
      "prescriptionRequests",
      "operator",
      "pendingCount",
    ]);
  });

  it("la query key debe ser un array inmutable (as const)", () => {
    const key = operatorPrescriptionNotificationKeys.pendingCount;
    expect(Array.isArray(key)).toBe(true);
    expect(key).toHaveLength(3);
  });
});

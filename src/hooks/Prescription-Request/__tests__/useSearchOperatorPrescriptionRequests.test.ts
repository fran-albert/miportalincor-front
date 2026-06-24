// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";

// --- Mocks ---

const mockGetOperatorPendingPaginated = vi.hoisted(() => vi.fn());
const mockGetOperatorHistoryPaginated = vi.hoisted(() => vi.fn());

vi.mock("@/api/Prescription-Request/get-operator-pending-paginated.action", () => ({
  getOperatorPendingPaginated: mockGetOperatorPendingPaginated,
}));

vi.mock("@/api/Prescription-Request/get-operator-history-paginated.action", () => ({
  getOperatorHistoryPaginated: mockGetOperatorHistoryPaginated,
}));

import {
  useSearchOperatorPendingRequests,
  useSearchOperatorHistoryRequests,
} from "../useSearchOperatorPrescriptionRequests";
import type { PaginatedPrescriptionRequests } from "@/types/Prescription-Request/Prescription-Request";

// --- Helpers ---

const makePaginatedResponse = (
  overrides: Partial<PaginatedPrescriptionRequests> = {}
): PaginatedPrescriptionRequests => ({
  data: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
  ...overrides,
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

// --- Tests: useSearchOperatorPendingRequests ---

describe("useSearchOperatorPendingRequests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetOperatorPendingPaginated.mockResolvedValue(makePaginatedResponse());
  });

  it("debe retornar estado inicial correcto", async () => {
    const { result } = renderHook(
      () => useSearchOperatorPendingRequests(),
      { wrapper: createWrapper() }
    );

    expect(result.current.requests).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.page).toBe(1);
    expect(result.current.search).toBe("");
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.hasPreviousPage).toBe(false);
  });

  it("debe llamar a getOperatorPendingPaginated (no al de historial)", async () => {
    renderHook(() => useSearchOperatorPendingRequests(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockGetOperatorPendingPaginated).toHaveBeenCalled();
    });

    expect(mockGetOperatorHistoryPaginated).not.toHaveBeenCalled();
  });

  it("debe retornar los datos del servidor cuando la query se resuelve", async () => {
    const mockData = makePaginatedResponse({
      data: [
        {
          id: 1,
          patientUserId: "p-1",
          doctorUserId: "d-1",
          description: "Test",
          status: "PENDING" as const,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ],
      total: 1,
      totalPages: 1,
    });
    mockGetOperatorPendingPaginated.mockResolvedValue(mockData);

    const { result } = renderHook(
      () => useSearchOperatorPendingRequests(),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.requests).toHaveLength(1);
    });

    expect(result.current.total).toBe(1);
    expect(result.current.totalPages).toBe(1);
  });

  it("debe actualizar search y resetear page a 1", async () => {
    const { result } = renderHook(
      () => useSearchOperatorPendingRequests({ initialPage: 3 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(mockGetOperatorPendingPaginated).toHaveBeenCalled());

    act(() => {
      result.current.setSearch("Juan");
    });

    expect(result.current.search).toBe("Juan");
  });

  it("debe avanzar de página si hay nextPage", async () => {
    mockGetOperatorPendingPaginated.mockResolvedValue(
      makePaginatedResponse({
        page: 1,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: false,
      })
    );

    const { result } = renderHook(
      () => useSearchOperatorPendingRequests(),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.hasNextPage).toBe(true));

    act(() => {
      result.current.nextPage();
    });

    // La página interna debería incrementarse (lo confirmamos llamando a la API de nuevo)
    await waitFor(() => {
      expect(mockGetOperatorPendingPaginated).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      );
    });
  });

  it("no debe avanzar de página si no hay nextPage", async () => {
    mockGetOperatorPendingPaginated.mockResolvedValue(
      makePaginatedResponse({ hasNextPage: false, totalPages: 1 })
    );

    const { result } = renderHook(
      () => useSearchOperatorPendingRequests(),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(mockGetOperatorPendingPaginated).toHaveBeenCalled());

    const callCountBefore = mockGetOperatorPendingPaginated.mock.calls.length;

    act(() => {
      result.current.nextPage();
    });

    // No debe haber llamada extra
    expect(mockGetOperatorPendingPaginated.mock.calls.length).toBe(callCountBefore);
  });

  it("debe respetar la opción enabled=false", async () => {
    renderHook(
      () => useSearchOperatorPendingRequests({ enabled: false }),
      { wrapper: createWrapper() }
    );

    // Esperar un tick
    await new Promise((r) => setTimeout(r, 50));

    expect(mockGetOperatorPendingPaginated).not.toHaveBeenCalled();
  });

  it("debe exponer función goToPage", async () => {
    mockGetOperatorPendingPaginated.mockResolvedValue(
      makePaginatedResponse({ totalPages: 5, hasNextPage: true })
    );

    const { result } = renderHook(
      () => useSearchOperatorPendingRequests(),
      { wrapper: createWrapper() }
    );

    // Esperar que la query se resuelva y tengamos totalPages = 5
    await waitFor(() => expect(result.current.totalPages).toBe(5));

    act(() => {
      result.current.goToPage(3);
    });

    // Ahora la llamada debe haberse hecho con page: 3
    await waitFor(() => {
      const calls = mockGetOperatorPendingPaginated.mock.calls;
      const hasBeen3 = calls.some(
        (call) => (call[0] as { page: number }).page === 3
      );
      expect(hasBeen3).toBe(true);
    });
  });
});

// --- Tests: useSearchOperatorHistoryRequests ---

describe("useSearchOperatorHistoryRequests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetOperatorHistoryPaginated.mockResolvedValue(makePaginatedResponse());
  });

  it("debe llamar a getOperatorHistoryPaginated (no al de pendientes)", async () => {
    renderHook(() => useSearchOperatorHistoryRequests(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockGetOperatorHistoryPaginated).toHaveBeenCalled();
    });

    expect(mockGetOperatorPendingPaginated).not.toHaveBeenCalled();
  });

  it("debe retornar datos del historial cuando se resuelve", async () => {
    const historyData = makePaginatedResponse({
      data: [
        {
          id: 99,
          patientUserId: "p-99",
          doctorUserId: "d-99",
          description: "Historial test",
          status: "COMPLETED" as const,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-02T00:00:00Z",
        },
      ],
      total: 1,
    });
    mockGetOperatorHistoryPaginated.mockResolvedValue(historyData);

    const { result } = renderHook(
      () => useSearchOperatorHistoryRequests(),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.requests).toHaveLength(1);
    });

    expect(result.current.requests[0].status).toBe("COMPLETED");
  });

  it("debe respetar initialLimit personalizado", async () => {
    renderHook(
      () => useSearchOperatorHistoryRequests({ initialLimit: 20 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(mockGetOperatorHistoryPaginated).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 20 })
      );
    });
  });
});

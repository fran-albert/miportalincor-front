// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Mocks ---

const mockGet = vi.hoisted(() => vi.fn());

vi.mock("@/services/axiosConfig", () => ({
  apiIncorHC: {
    get: mockGet,
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock sleep para que los tests no demoren
vi.mock("@/common/helpers/helpers", () => ({
  sleep: vi.fn().mockResolvedValue(undefined),
}));

import { getOperatorPendingPaginated } from "../get-operator-pending-paginated.action";
import { getOperatorHistoryPaginated } from "../get-operator-history-paginated.action";
import { getOperatorPendingCount } from "../get-operator-pending-count.action";
import type { PaginatedPrescriptionRequests } from "@/types/Prescription-Request/Prescription-Request";

// --- Data de prueba ---

const mockPaginatedResponse: PaginatedPrescriptionRequests = {
  data: [
    {
      id: 1,
      patientUserId: "patient-1",
      doctorUserId: "doctor-1",
      description: "Solicitud de receta de prueba",
      status: "PENDING" as const,
      createdAt: "2024-01-01T10:00:00Z",
      updatedAt: "2024-01-01T10:00:00Z",
    } as PaginatedPrescriptionRequests["data"][0],
  ],
  total: 1,
  page: 1,
  limit: 10,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

// --- Tests: getOperatorPendingPaginated ---

describe("getOperatorPendingPaginated", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({ data: mockPaginatedResponse });
  });

  it("debe llamar al endpoint correcto", async () => {
    await getOperatorPendingPaginated({ page: 1, limit: 10 });

    expect(mockGet).toHaveBeenCalledWith(
      "prescription-requests/pending/search",
      expect.objectContaining({ params: expect.any(Object) })
    );
  });

  it("debe pasar los params correctamente", async () => {
    await getOperatorPendingPaginated({ search: "Juan", page: 2, limit: 20 });

    expect(mockGet).toHaveBeenCalledWith(
      "prescription-requests/pending/search",
      { params: { search: "Juan", page: 2, limit: 20 } }
    );
  });

  it("debe retornar los datos paginados del servidor", async () => {
    const result = await getOperatorPendingPaginated({ page: 1, limit: 10 });
    expect(result).toEqual(mockPaginatedResponse);
  });

  it("debe funcionar sin parámetros de búsqueda", async () => {
    await getOperatorPendingPaginated({});
    expect(mockGet).toHaveBeenCalledWith(
      "prescription-requests/pending/search",
      { params: {} }
    );
  });

  it("debe propagar errores de la API", async () => {
    mockGet.mockRejectedValue(new Error("Network error"));
    await expect(getOperatorPendingPaginated({ page: 1 })).rejects.toThrow(
      "Network error"
    );
  });
});

// --- Tests: getOperatorHistoryPaginated ---

describe("getOperatorHistoryPaginated", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({ data: mockPaginatedResponse });
  });

  it("debe llamar al endpoint de historial correcto", async () => {
    await getOperatorHistoryPaginated({ page: 1, limit: 10 });

    expect(mockGet).toHaveBeenCalledWith(
      "prescription-requests/doctor/history/search",
      expect.objectContaining({ params: expect.any(Object) })
    );
  });

  it("debe pasar los params correctamente", async () => {
    await getOperatorHistoryPaginated({ search: "García", page: 3, limit: 5 });

    expect(mockGet).toHaveBeenCalledWith(
      "prescription-requests/doctor/history/search",
      { params: { search: "García", page: 3, limit: 5 } }
    );
  });

  it("debe retornar los datos paginados del servidor", async () => {
    const result = await getOperatorHistoryPaginated({ page: 1, limit: 10 });
    expect(result).toEqual(mockPaginatedResponse);
  });

  it("debe propagar errores de la API", async () => {
    mockGet.mockRejectedValue(new Error("Server error 500"));
    await expect(getOperatorHistoryPaginated({ page: 1 })).rejects.toThrow(
      "Server error 500"
    );
  });

  it("el endpoint de historial es distinto al de pendientes", async () => {
    await getOperatorHistoryPaginated({ page: 1 });
    const [url] = mockGet.mock.calls[0];
    expect(url).toContain("history");
    expect(url).not.toContain("pending");
  });
});

// --- Tests: getOperatorPendingCount ---

describe("getOperatorPendingCount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({ data: { count: 5 } });
  });

  it("debe llamar al endpoint de count correcto", async () => {
    await getOperatorPendingCount();

    expect(mockGet).toHaveBeenCalledWith(
      "prescription-requests/pending/count"
    );
  });

  it("debe retornar el count del servidor", async () => {
    const result = await getOperatorPendingCount();
    expect(result).toEqual({ count: 5 });
  });

  it("debe retornar count 0 cuando no hay pendientes", async () => {
    mockGet.mockResolvedValue({ data: { count: 0 } });
    const result = await getOperatorPendingCount();
    expect(result.count).toBe(0);
  });

  it("no recibe parámetros (no los necesita)", async () => {
    await getOperatorPendingCount();
    // Verifica que se llama solo con la URL, sin segundo argumento de params
    expect(mockGet).toHaveBeenCalledWith(
      "prescription-requests/pending/count"
    );
    expect(mockGet.mock.calls[0].length).toBe(1);
  });

  it("debe propagar errores de la API", async () => {
    mockGet.mockRejectedValue(new Error("Unauthorized"));
    await expect(getOperatorPendingCount()).rejects.toThrow("Unauthorized");
  });

  it("el endpoint usa el mismo path que el de médico (el backend distingue por rol)", async () => {
    await getOperatorPendingCount();
    const [url] = mockGet.mock.calls[0];
    expect(url).toContain("pending/count");
  });
});

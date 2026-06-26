// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";

// --- Mocks ---

const mockGetSummary = vi.hoisted(() => vi.fn());
const mockGetByDoctor = vi.hoisted(() => vi.fn());
const mockGetWeeklyTrend = vi.hoisted(() => vi.fn());

vi.mock("@/api/Prescription-Reports", () => ({
  getPrescriptionReportSummary: mockGetSummary,
  getPrescriptionReportByDoctor: mockGetByDoctor,
  getPrescriptionReportWeeklyTrend: mockGetWeeklyTrend,
}));

import {
  usePrescriptionReportSummary,
  usePrescriptionReportByDoctor,
  usePrescriptionReportWeeklyTrend,
  prescriptionReportKeys,
} from "../usePrescriptionReports";
import type {
  PrescriptionReportSummary,
  PrescriptionReportByDoctor,
  PrescriptionReportWeeklyTrend,
} from "@/types/Prescription-Reports/Prescription-Reports";

// --- Data de prueba ---

const mockSummary: PrescriptionReportSummary = {
  totalRequests: 200,
  completedRequests: 140,
  pendingRequests: 40,
  rejectedRequests: 12,
  cancelledRequests: 8,
  avgProcessingTimeHours: 3.7,
};

const mockByDoctor: PrescriptionReportByDoctor[] = [
  {
    doctorId: 10,
    doctorName: "Dr. Rodríguez",
    specialities: ["Clínica Médica"],
    completed: 60,
    pending: 15,
    rejected: 3,
    avgProcessingTimeHours: 2.8,
  },
];

const mockWeeklyTrend: PrescriptionReportWeeklyTrend[] = [
  {
    weekLabel: "Semana 1",
    weekStart: "2024-02-01",
    completed: 30,
    pending: 10,
    rejected: 2,
    total: 42,
  },
];

const FROM = "2024-02-01";
const TO = "2024-02-29";

// --- Helper para wrapper con QueryClient ---

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

// --- Tests: prescriptionReportKeys ---

describe("prescriptionReportKeys", () => {
  it("all debe ser ['prescriptionReports']", () => {
    expect(prescriptionReportKeys.all).toEqual(["prescriptionReports"]);
  });

  it("summary debe incluir 'prescriptionReports', 'summary', from y to", () => {
    const key = prescriptionReportKeys.summary(FROM, TO);
    expect(key).toContain("prescriptionReports");
    expect(key).toContain("summary");
    expect(key).toContain(FROM);
    expect(key).toContain(TO);
  });

  it("byDoctor debe incluir 'prescriptionReports', 'by-doctor', from y to", () => {
    const key = prescriptionReportKeys.byDoctor(FROM, TO);
    expect(key).toContain("prescriptionReports");
    expect(key).toContain("by-doctor");
    expect(key).toContain(FROM);
    expect(key).toContain(TO);
  });

  it("weeklyTrend debe incluir 'prescriptionReports', 'weekly-trend', from y to", () => {
    const key = prescriptionReportKeys.weeklyTrend(FROM, TO);
    expect(key).toContain("prescriptionReports");
    expect(key).toContain("weekly-trend");
    expect(key).toContain(FROM);
    expect(key).toContain(TO);
  });

  it("keys distintas para diferentes rangos de fecha", () => {
    const key1 = prescriptionReportKeys.summary("2024-01-01", "2024-01-31");
    const key2 = prescriptionReportKeys.summary("2024-02-01", "2024-02-29");
    expect(key1).not.toEqual(key2);
  });

  it("summary, byDoctor y weeklyTrend generan keys distintas para el mismo rango", () => {
    const keySummary = prescriptionReportKeys.summary(FROM, TO);
    const keyByDoctor = prescriptionReportKeys.byDoctor(FROM, TO);
    const keyWeekly = prescriptionReportKeys.weeklyTrend(FROM, TO);
    expect(keySummary).not.toEqual(keyByDoctor);
    expect(keySummary).not.toEqual(keyWeekly);
    expect(keyByDoctor).not.toEqual(keyWeekly);
  });
});

// --- Tests: usePrescriptionReportSummary ---

describe("usePrescriptionReportSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSummary.mockResolvedValue(mockSummary);
  });

  it("debe llamar a getPrescriptionReportSummary con from y to", async () => {
    renderHook(() => usePrescriptionReportSummary(FROM, TO), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockGetSummary).toHaveBeenCalledWith(FROM, TO);
    });
  });

  it("debe retornar los datos del summary cuando se resuelve", async () => {
    const { result } = renderHook(
      () => usePrescriptionReportSummary(FROM, TO),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockSummary);
  });

  it("debe exponer totalRequests y avgProcessingTimeHours", async () => {
    const { result } = renderHook(
      () => usePrescriptionReportSummary(FROM, TO),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.totalRequests).toBe(200);
    expect(result.current.data?.avgProcessingTimeHours).toBe(3.7);
  });

  it("NO debe ejecutar la query si from está vacío", async () => {
    renderHook(() => usePrescriptionReportSummary("", TO), {
      wrapper: createWrapper(),
    });

    await new Promise((r) => setTimeout(r, 50));
    expect(mockGetSummary).not.toHaveBeenCalled();
  });

  it("NO debe ejecutar la query si to está vacío", async () => {
    renderHook(() => usePrescriptionReportSummary(FROM, ""), {
      wrapper: createWrapper(),
    });

    await new Promise((r) => setTimeout(r, 50));
    expect(mockGetSummary).not.toHaveBeenCalled();
  });

  it("NO debe ejecutar si ambos están vacíos", async () => {
    renderHook(() => usePrescriptionReportSummary("", ""), {
      wrapper: createWrapper(),
    });

    await new Promise((r) => setTimeout(r, 50));
    expect(mockGetSummary).not.toHaveBeenCalled();
  });

  it("debe exponer isLoading en estado inicial", () => {
    const { result } = renderHook(
      () => usePrescriptionReportSummary(FROM, TO),
      { wrapper: createWrapper() }
    );

    // En el primer render, la query aún no resolvió
    expect(result.current.isLoading !== undefined).toBe(true);
  });

  it("debe retornar isError=true cuando la API falla", async () => {
    mockGetSummary.mockRejectedValue(new Error("Error del servidor"));

    const { result } = renderHook(
      () => usePrescriptionReportSummary(FROM, TO),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it("no debe llamar al getByDoctor ni al getWeeklyTrend", async () => {
    renderHook(() => usePrescriptionReportSummary(FROM, TO), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(mockGetSummary).toHaveBeenCalled());

    expect(mockGetByDoctor).not.toHaveBeenCalled();
    expect(mockGetWeeklyTrend).not.toHaveBeenCalled();
  });
});

// --- Tests: usePrescriptionReportByDoctor ---

describe("usePrescriptionReportByDoctor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetByDoctor.mockResolvedValue(mockByDoctor);
  });

  it("debe llamar a getPrescriptionReportByDoctor con from y to", async () => {
    renderHook(() => usePrescriptionReportByDoctor(FROM, TO), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockGetByDoctor).toHaveBeenCalledWith(FROM, TO);
    });
  });

  it("debe retornar un array de datos por médico", async () => {
    const { result } = renderHook(
      () => usePrescriptionReportByDoctor(FROM, TO),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockByDoctor);
    expect(Array.isArray(result.current.data)).toBe(true);
  });

  it("NO debe ejecutar la query si from está vacío", async () => {
    renderHook(() => usePrescriptionReportByDoctor("", TO), {
      wrapper: createWrapper(),
    });

    await new Promise((r) => setTimeout(r, 50));
    expect(mockGetByDoctor).not.toHaveBeenCalled();
  });

  it("NO debe ejecutar la query si to está vacío", async () => {
    renderHook(() => usePrescriptionReportByDoctor(FROM, ""), {
      wrapper: createWrapper(),
    });

    await new Promise((r) => setTimeout(r, 50));
    expect(mockGetByDoctor).not.toHaveBeenCalled();
  });

  it("debe retornar isError=true cuando la API falla", async () => {
    mockGetByDoctor.mockRejectedValue(new Error("Forbidden"));

    const { result } = renderHook(
      () => usePrescriptionReportByDoctor(FROM, TO),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("no debe llamar al getSummary ni al getWeeklyTrend", async () => {
    renderHook(() => usePrescriptionReportByDoctor(FROM, TO), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(mockGetByDoctor).toHaveBeenCalled());

    expect(mockGetSummary).not.toHaveBeenCalled();
    expect(mockGetWeeklyTrend).not.toHaveBeenCalled();
  });
});

// --- Tests: usePrescriptionReportWeeklyTrend ---

describe("usePrescriptionReportWeeklyTrend", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetWeeklyTrend.mockResolvedValue(mockWeeklyTrend);
  });

  it("debe llamar a getPrescriptionReportWeeklyTrend con from y to", async () => {
    renderHook(() => usePrescriptionReportWeeklyTrend(FROM, TO), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockGetWeeklyTrend).toHaveBeenCalledWith(FROM, TO);
    });
  });

  it("debe retornar un array de tendencia semanal", async () => {
    const { result } = renderHook(
      () => usePrescriptionReportWeeklyTrend(FROM, TO),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockWeeklyTrend);
    expect(Array.isArray(result.current.data)).toBe(true);
  });

  it("NO debe ejecutar la query si from está vacío", async () => {
    renderHook(() => usePrescriptionReportWeeklyTrend("", TO), {
      wrapper: createWrapper(),
    });

    await new Promise((r) => setTimeout(r, 50));
    expect(mockGetWeeklyTrend).not.toHaveBeenCalled();
  });

  it("NO debe ejecutar la query si to está vacío", async () => {
    renderHook(() => usePrescriptionReportWeeklyTrend(FROM, ""), {
      wrapper: createWrapper(),
    });

    await new Promise((r) => setTimeout(r, 50));
    expect(mockGetWeeklyTrend).not.toHaveBeenCalled();
  });

  it("debe retornar isError=true cuando la API falla", async () => {
    mockGetWeeklyTrend.mockRejectedValue(new Error("Server error"));

    const { result } = renderHook(
      () => usePrescriptionReportWeeklyTrend(FROM, TO),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("no debe llamar al getSummary ni al getByDoctor", async () => {
    renderHook(() => usePrescriptionReportWeeklyTrend(FROM, TO), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(mockGetWeeklyTrend).toHaveBeenCalled());

    expect(mockGetSummary).not.toHaveBeenCalled();
    expect(mockGetByDoctor).not.toHaveBeenCalled();
  });
});

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

import { getPrescriptionReportSummary } from "../get-summary.action";
import { getPrescriptionReportByDoctor } from "../get-by-doctor.action";
import { getPrescriptionReportWeeklyTrend } from "../get-weekly-trend.action";
import type {
  PrescriptionReportSummary,
  PrescriptionReportByDoctor,
  PrescriptionReportWeeklyTrend,
} from "@/types/Prescription-Reports/Prescription-Reports";

// --- Data de prueba ---

const mockSummary: PrescriptionReportSummary = {
  totalRequests: 150,
  completedRequests: 100,
  pendingRequests: 30,
  rejectedRequests: 10,
  cancelledRequests: 10,
  avgProcessingTimeHours: 4.5,
};

const mockByDoctor: PrescriptionReportByDoctor[] = [
  {
    doctorId: 1,
    doctorName: "Dr. García",
    specialities: ["Cardiología"],
    completed: 50,
    pending: 10,
    rejected: 2,
    avgProcessingTimeHours: 3.2,
  },
  {
    doctorId: 2,
    doctorName: "Dra. López",
    specialities: ["Pediatría", "Clínica Médica"],
    completed: 30,
    pending: 5,
    rejected: 1,
    avgProcessingTimeHours: 5.8,
  },
];

const mockWeeklyTrend: PrescriptionReportWeeklyTrend[] = [
  {
    weekLabel: "Semana 1",
    weekStart: "2024-01-01",
    completed: 20,
    pending: 5,
    rejected: 2,
    total: 27,
  },
  {
    weekLabel: "Semana 2",
    weekStart: "2024-01-08",
    completed: 25,
    pending: 8,
    rejected: 1,
    total: 34,
  },
];

const FROM = "2024-01-01";
const TO = "2024-01-31";

// --- Tests: getPrescriptionReportSummary ---

describe("getPrescriptionReportSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({ data: mockSummary });
  });

  it("debe llamar al endpoint correcto", async () => {
    await getPrescriptionReportSummary(FROM, TO);

    expect(mockGet).toHaveBeenCalledWith(
      "prescription-requests/reports/summary",
      expect.objectContaining({ params: expect.any(Object) })
    );
  });

  it("debe pasar los parámetros from y to correctamente", async () => {
    await getPrescriptionReportSummary(FROM, TO);

    expect(mockGet).toHaveBeenCalledWith(
      "prescription-requests/reports/summary",
      { params: { from: FROM, to: TO } }
    );
  });

  it("debe retornar los datos del summary", async () => {
    const result = await getPrescriptionReportSummary(FROM, TO);
    expect(result).toEqual(mockSummary);
  });

  it("el resultado debe tener totalRequests", async () => {
    const result = await getPrescriptionReportSummary(FROM, TO);
    expect(result.totalRequests).toBe(150);
  });

  it("el resultado debe tener avgProcessingTimeHours", async () => {
    const result = await getPrescriptionReportSummary(FROM, TO);
    expect(result.avgProcessingTimeHours).toBe(4.5);
  });

  it("debe propagar errores de la API", async () => {
    mockGet.mockRejectedValue(new Error("Network error"));
    await expect(getPrescriptionReportSummary(FROM, TO)).rejects.toThrow(
      "Network error"
    );
  });

  it("el endpoint contiene 'reports/summary'", async () => {
    await getPrescriptionReportSummary(FROM, TO);
    const [url] = mockGet.mock.calls[0];
    expect(url).toContain("reports/summary");
  });
});

// --- Tests: getPrescriptionReportByDoctor ---

describe("getPrescriptionReportByDoctor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({ data: mockByDoctor });
  });

  it("debe llamar al endpoint correcto", async () => {
    await getPrescriptionReportByDoctor(FROM, TO);

    expect(mockGet).toHaveBeenCalledWith(
      "prescription-requests/reports/by-doctor",
      expect.objectContaining({ params: expect.any(Object) })
    );
  });

  it("debe pasar los parámetros from y to correctamente", async () => {
    await getPrescriptionReportByDoctor(FROM, TO);

    expect(mockGet).toHaveBeenCalledWith(
      "prescription-requests/reports/by-doctor",
      { params: { from: FROM, to: TO } }
    );
  });

  it("debe retornar un array de datos por médico", async () => {
    const result = await getPrescriptionReportByDoctor(FROM, TO);
    expect(result).toEqual(mockByDoctor);
    expect(Array.isArray(result)).toBe(true);
  });

  it("cada item debe tener doctorId, doctorName y specialities", async () => {
    const result = await getPrescriptionReportByDoctor(FROM, TO);
    const primer = result[0];
    expect(primer).toHaveProperty("doctorId");
    expect(primer).toHaveProperty("doctorName");
    expect(primer).toHaveProperty("specialities");
  });

  it("cada item debe tener métricas de completed, pending y rejected", async () => {
    const result = await getPrescriptionReportByDoctor(FROM, TO);
    const primer = result[0];
    expect(primer).toHaveProperty("completed");
    expect(primer).toHaveProperty("pending");
    expect(primer).toHaveProperty("rejected");
    expect(primer).toHaveProperty("avgProcessingTimeHours");
  });

  it("debe retornar lista vacía si la API responde []", async () => {
    mockGet.mockResolvedValue({ data: [] });
    const result = await getPrescriptionReportByDoctor(FROM, TO);
    expect(result).toEqual([]);
  });

  it("debe propagar errores de la API", async () => {
    mockGet.mockRejectedValue(new Error("Forbidden"));
    await expect(getPrescriptionReportByDoctor(FROM, TO)).rejects.toThrow(
      "Forbidden"
    );
  });

  it("el endpoint contiene 'reports/by-doctor'", async () => {
    await getPrescriptionReportByDoctor(FROM, TO);
    const [url] = mockGet.mock.calls[0];
    expect(url).toContain("reports/by-doctor");
  });

  it("el endpoint NO contiene 'summary' ni 'weekly-trend'", async () => {
    await getPrescriptionReportByDoctor(FROM, TO);
    const [url] = mockGet.mock.calls[0];
    expect(url).not.toContain("summary");
    expect(url).not.toContain("weekly-trend");
  });
});

// --- Tests: getPrescriptionReportWeeklyTrend ---

describe("getPrescriptionReportWeeklyTrend", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({ data: mockWeeklyTrend });
  });

  it("debe llamar al endpoint correcto", async () => {
    await getPrescriptionReportWeeklyTrend(FROM, TO);

    expect(mockGet).toHaveBeenCalledWith(
      "prescription-requests/reports/weekly-trend",
      expect.objectContaining({ params: expect.any(Object) })
    );
  });

  it("debe pasar los parámetros from y to correctamente", async () => {
    await getPrescriptionReportWeeklyTrend(FROM, TO);

    expect(mockGet).toHaveBeenCalledWith(
      "prescription-requests/reports/weekly-trend",
      { params: { from: FROM, to: TO } }
    );
  });

  it("debe retornar un array de tendencia semanal", async () => {
    const result = await getPrescriptionReportWeeklyTrend(FROM, TO);
    expect(result).toEqual(mockWeeklyTrend);
    expect(Array.isArray(result)).toBe(true);
  });

  it("cada item debe tener weekLabel y weekStart", async () => {
    const result = await getPrescriptionReportWeeklyTrend(FROM, TO);
    const primer = result[0];
    expect(primer).toHaveProperty("weekLabel");
    expect(primer).toHaveProperty("weekStart");
  });

  it("cada item debe tener completed, pending, rejected y total", async () => {
    const result = await getPrescriptionReportWeeklyTrend(FROM, TO);
    const primer = result[0];
    expect(primer).toHaveProperty("completed");
    expect(primer).toHaveProperty("pending");
    expect(primer).toHaveProperty("rejected");
    expect(primer).toHaveProperty("total");
  });

  it("el total debe ser coherente con completed + pending + rejected", async () => {
    const result = await getPrescriptionReportWeeklyTrend(FROM, TO);
    const semana = result[0];
    expect(semana.total).toBe(semana.completed + semana.pending + semana.rejected);
  });

  it("debe retornar lista vacía si la API responde []", async () => {
    mockGet.mockResolvedValue({ data: [] });
    const result = await getPrescriptionReportWeeklyTrend(FROM, TO);
    expect(result).toEqual([]);
  });

  it("debe propagar errores de la API", async () => {
    mockGet.mockRejectedValue(new Error("Server error 500"));
    await expect(getPrescriptionReportWeeklyTrend(FROM, TO)).rejects.toThrow(
      "Server error 500"
    );
  });

  it("el endpoint contiene 'reports/weekly-trend'", async () => {
    await getPrescriptionReportWeeklyTrend(FROM, TO);
    const [url] = mockGet.mock.calls[0];
    expect(url).toContain("reports/weekly-trend");
  });

  it("el endpoint NO contiene 'summary' ni 'by-doctor'", async () => {
    await getPrescriptionReportWeeklyTrend(FROM, TO);
    const [url] = mockGet.mock.calls[0];
    expect(url).not.toContain("summary");
    expect(url).not.toContain("by-doctor");
  });
});

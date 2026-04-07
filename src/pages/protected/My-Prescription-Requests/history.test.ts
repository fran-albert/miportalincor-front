import { describe, expect, it } from "vitest";
import {
  PrescriptionRequest,
  PrescriptionRequestStatus,
} from "@/types/Prescription-Request/Prescription-Request";
import {
  buildPrescriptionHistoryEntries,
  sortPrescriptionRequests,
} from "./history";

const makeRequest = (
  id: number,
  overrides: Partial<PrescriptionRequest> = {},
): PrescriptionRequest => ({
  id,
  patientUserId: "patient-1",
  doctorUserId: "doctor-1",
  description: `Solicitud de receta desde Cartón Verde: Medicacion ${id} - 10 MG (Cena) - Cant: 1`,
  status: PrescriptionRequestStatus.PENDING,
  createdAt: "2026-04-07T10:00:00.000Z",
  updatedAt: "2026-04-07T10:00:00.000Z",
  deletedAt: "",
  ...overrides,
});

describe("sortPrescriptionRequests", () => {
  it("prioriza pendientes antes que completadas", () => {
    const completed = makeRequest(1, {
      status: PrescriptionRequestStatus.COMPLETED,
      createdAt: "2026-04-07T12:00:00.000Z",
    });
    const pending = makeRequest(2, {
      status: PrescriptionRequestStatus.PENDING,
      createdAt: "2026-04-07T11:00:00.000Z",
    });

    const result = sortPrescriptionRequests([completed, pending]);

    expect(result.map((request) => request.id)).toEqual([2, 1]);
  });
});

describe("buildPrescriptionHistoryEntries", () => {
  it("agrupa solicitudes con el mismo batchId en una sola entrada", () => {
    const result = buildPrescriptionHistoryEntries([
      makeRequest(1, {
        batchId: "batch-1",
        status: PrescriptionRequestStatus.COMPLETED,
        prescriptionUrls: ["https://example.com/receta-a.pdf"],
      }),
      makeRequest(2, {
        batchId: "batch-1",
        status: PrescriptionRequestStatus.COMPLETED,
        prescriptionUrls: ["https://example.com/receta-a.pdf"],
      }),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("batch");

    if (result[0].type === "batch") {
      expect(result[0].requests).toHaveLength(2);
      expect(result[0].prescriptionUrls).toEqual([
        "https://example.com/receta-a.pdf",
      ]);
      expect(result[0].medications.map((medication) => medication.name)).toEqual([
        "Medicacion 1",
        "Medicacion 2",
      ]);
    }
  });

  it("mantiene solicitudes sin batchId como entradas individuales", () => {
    const result = buildPrescriptionHistoryEntries([
      makeRequest(1),
      makeRequest(2, { batchId: "batch-2" }),
      makeRequest(3, { batchId: "batch-2" }),
    ]);

    expect(result).toHaveLength(2);
    expect(result.some((entry) => entry.type === "batch")).toBe(true);
    expect(result.some((entry) => entry.type === "individual")).toBe(true);
  });

  it("deduplica archivos y links repetidos dentro del mismo lote", () => {
    const result = buildPrescriptionHistoryEntries([
      makeRequest(1, {
        batchId: "batch-3",
        status: PrescriptionRequestStatus.COMPLETED,
        prescriptionUrls: [
          "https://example.com/receta-1.pdf",
          "https://example.com/receta-2.pdf",
        ],
        prescriptionLink: "https://example.com/link",
      }),
      makeRequest(2, {
        batchId: "batch-3",
        status: PrescriptionRequestStatus.COMPLETED,
        prescriptionUrls: [
          "https://example.com/receta-1.pdf",
          "https://example.com/receta-2.pdf",
        ],
        prescriptionLink: "https://example.com/link",
      }),
    ]);

    expect(result).toHaveLength(1);
    if (result[0].type === "batch") {
      expect(result[0].prescriptionUrls).toEqual([
        "https://example.com/receta-1.pdf",
        "https://example.com/receta-2.pdf",
      ]);
      expect(result[0].prescriptionLinks).toEqual(["https://example.com/link"]);
    }
  });
});

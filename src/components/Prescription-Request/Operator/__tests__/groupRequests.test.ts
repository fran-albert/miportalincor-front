// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import type { PrescriptionRequest } from "@/types/Prescription-Request/Prescription-Request";

/**
 * Replica de la función groupRequests del componente Operator.
 * Se testea aquí como lógica pura para verificar el correcto agrupado de solicitudes.
 */
function groupRequests(requests: PrescriptionRequest[]) {
  const batches = new Map<string, PrescriptionRequest[]>();
  const individual: PrescriptionRequest[] = [];

  for (const req of requests) {
    if (req.batchId) {
      const existing = batches.get(req.batchId) || [];
      existing.push(req);
      batches.set(req.batchId, existing);
    } else {
      individual.push(req);
    }
  }

  const groups: Array<
    | { type: "batch"; batchId: string; requests: PrescriptionRequest[] }
    | { type: "individual"; request: PrescriptionRequest }
  > = [];

  for (const [batchId, reqs] of batches) {
    groups.push({ type: "batch", batchId, requests: reqs });
  }
  for (const req of individual) {
    groups.push({ type: "individual", request: req });
  }

  return groups;
}

// --- Data helpers ---

const makeRequest = (
  id: number,
  overrides: Partial<PrescriptionRequest> = {}
): PrescriptionRequest => ({
  id,
  patientUserId: `patient-${id}`,
  doctorUserId: `doctor-${id}`,
  description: `Solicitud ${id}`,
  status: "PENDING" as const,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  ...overrides,
});

// --- Tests ---

describe("groupRequests", () => {
  it("debe retornar array vacío cuando no hay solicitudes", () => {
    const result = groupRequests([]);
    expect(result).toEqual([]);
  });

  it("debe clasificar una sola solicitud sin batchId como individual", () => {
    const req = makeRequest(1);
    const result = groupRequests([req]);

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("individual");
    if (result[0].type === "individual") {
      expect(result[0].request.id).toBe(1);
    }
  });

  it("debe agrupar solicitudes con el mismo batchId como batch", () => {
    const reqs = [
      makeRequest(1, { batchId: "batch-A" }),
      makeRequest(2, { batchId: "batch-A" }),
    ];
    const result = groupRequests(reqs);

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("batch");
    if (result[0].type === "batch") {
      expect(result[0].batchId).toBe("batch-A");
      expect(result[0].requests).toHaveLength(2);
    }
  });

  it("debe crear grupos separados para batchIds distintos", () => {
    const reqs = [
      makeRequest(1, { batchId: "batch-A" }),
      makeRequest(2, { batchId: "batch-B" }),
    ];
    const result = groupRequests(reqs);

    expect(result).toHaveLength(2);
    expect(result.every((g) => g.type === "batch")).toBe(true);
  });

  it("debe mezclar correctamente batches e individuales", () => {
    const reqs = [
      makeRequest(1, { batchId: "batch-X" }),
      makeRequest(2), // individual
      makeRequest(3, { batchId: "batch-X" }),
      makeRequest(4), // individual
    ];
    const result = groupRequests(reqs);

    // 1 batch + 2 individuales
    expect(result).toHaveLength(3);

    const batches = result.filter((g) => g.type === "batch");
    const individuals = result.filter((g) => g.type === "individual");

    expect(batches).toHaveLength(1);
    expect(individuals).toHaveLength(2);

    if (batches[0].type === "batch") {
      expect(batches[0].requests).toHaveLength(2);
    }
  });

  it("los batches aparecen antes que los individuales", () => {
    const reqs = [
      makeRequest(1), // individual primero en el input
      makeRequest(2, { batchId: "batch-Z" }),
    ];
    const result = groupRequests(reqs);

    // La implementación pone batches primero
    expect(result[0].type).toBe("batch");
    expect(result[1].type).toBe("individual");
  });

  it("debe preservar todos los campos de las solicitudes dentro del batch", () => {
    const req = makeRequest(42, {
      batchId: "batch-1",
      status: "IN_PROGRESS" as const,
      description: "Solicitud con campos completos",
    });

    const result = groupRequests([req]);
    if (result[0].type === "batch") {
      const grouped = result[0].requests[0];
      expect(grouped.id).toBe(42);
      expect(grouped.status).toBe("IN_PROGRESS");
      expect(grouped.description).toBe("Solicitud con campos completos");
    }
  });

  it("solicitudes con batchId undefined o null se tratan como individuales", () => {
    const req1 = makeRequest(1, { batchId: undefined });
    const result = groupRequests([req1]);

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("individual");
  });

  it("debe manejar 3 batches distintos con múltiples items cada uno", () => {
    const reqs = [
      makeRequest(1, { batchId: "A" }),
      makeRequest(2, { batchId: "A" }),
      makeRequest(3, { batchId: "B" }),
      makeRequest(4, { batchId: "C" }),
      makeRequest(5, { batchId: "C" }),
      makeRequest(6, { batchId: "C" }),
    ];
    const result = groupRequests(reqs);

    expect(result).toHaveLength(3); // 3 batches
    const batchA = result.find(
      (g) => g.type === "batch" && g.batchId === "A"
    );
    const batchB = result.find(
      (g) => g.type === "batch" && g.batchId === "B"
    );
    const batchC = result.find(
      (g) => g.type === "batch" && g.batchId === "C"
    );

    expect(batchA).toBeTruthy();
    expect(batchB).toBeTruthy();
    expect(batchC).toBeTruthy();

    if (batchA?.type === "batch") expect(batchA.requests).toHaveLength(2);
    if (batchB?.type === "batch") expect(batchB.requests).toHaveLength(1);
    if (batchC?.type === "batch") expect(batchC.requests).toHaveLength(3);
  });
});

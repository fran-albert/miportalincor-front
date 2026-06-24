// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Mocks ---

const mockPost = vi.hoisted(() => vi.fn());

vi.mock("@/services/axiosConfig", () => ({
  apiIncorHC: {
    get: vi.fn(),
    post: mockPost,
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { requestPrescription } from "../request-prescription.action";
import { batchRequestPrescription } from "../batch-request-prescription.action";

// --- Tests ---

describe("requestPrescription", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPost.mockResolvedValue({ data: undefined });
  });

  it("debe hacer POST al endpoint correcto", async () => {
    await requestPrescription("card-1", "item-1");

    expect(mockPost).toHaveBeenCalledWith(
      "/green-cards/card-1/items/item-1/request-prescription",
      expect.any(Object)
    );
  });

  it("debe enviar doctorUserId en el body cuando se provee", async () => {
    await requestPrescription("card-1", "item-1", "doctor-123");

    expect(mockPost).toHaveBeenCalledWith(
      "/green-cards/card-1/items/item-1/request-prescription",
      { doctorUserId: "doctor-123" }
    );
  });

  it("debe enviar body vacío cuando no se provee doctorUserId", async () => {
    await requestPrescription("card-1", "item-1");

    expect(mockPost).toHaveBeenCalledWith(
      "/green-cards/card-1/items/item-1/request-prescription",
      {}
    );
  });

  it("debe enviar body vacío cuando doctorUserId es undefined explícito", async () => {
    await requestPrescription("card-1", "item-1", undefined);

    expect(mockPost).toHaveBeenCalledWith(
      "/green-cards/card-1/items/item-1/request-prescription",
      {}
    );
  });

  it("no debe incluir doctorUserId cuando es string vacío", async () => {
    // String vacío es falsy, entonces el spread condicional no lo incluye
    await requestPrescription("card-1", "item-1", "");

    const callArgs = mockPost.mock.calls[0][1];
    expect(callArgs).not.toHaveProperty("doctorUserId");
  });

  it("debe retornar void en caso exitoso", async () => {
    const result = await requestPrescription("card-1", "item-1", "doctor-123");
    expect(result).toBeUndefined();
  });
});

describe("batchRequestPrescription", () => {
  const mockBatchResult = {
    message: "ok",
    batches: [
      {
        batchId: "batch-1",
        doctorName: "Dr. Test",
        itemCount: 2,
        requestIds: ["req-1", "req-2"],
      },
    ],
    skippedItems: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPost.mockResolvedValue({ data: mockBatchResult });
  });

  it("debe hacer POST al endpoint correcto", async () => {
    await batchRequestPrescription("card-1", ["item-1", "item-2"]);

    expect(mockPost).toHaveBeenCalledWith(
      "/green-cards/card-1/batch-request-prescription",
      expect.any(Object)
    );
  });

  it("debe enviar itemIds en el body", async () => {
    await batchRequestPrescription("card-1", ["item-1", "item-2"]);

    const callArgs = mockPost.mock.calls[0][1];
    expect(callArgs.itemIds).toEqual(["item-1", "item-2"]);
  });

  it("debe enviar doctorUserId en el body cuando se provee", async () => {
    await batchRequestPrescription("card-1", ["item-1", "item-2"], "doctor-123");

    expect(mockPost).toHaveBeenCalledWith(
      "/green-cards/card-1/batch-request-prescription",
      { itemIds: ["item-1", "item-2"], doctorUserId: "doctor-123" }
    );
  });

  it("debe no incluir doctorUserId cuando no se provee", async () => {
    await batchRequestPrescription("card-1", ["item-1"]);

    const callArgs = mockPost.mock.calls[0][1];
    expect(callArgs).not.toHaveProperty("doctorUserId");
  });

  it("debe no incluir doctorUserId cuando es undefined", async () => {
    await batchRequestPrescription("card-1", ["item-1"], undefined);

    const callArgs = mockPost.mock.calls[0][1];
    expect(callArgs).not.toHaveProperty("doctorUserId");
  });

  it("debe no incluir doctorUserId cuando es string vacío (falsy)", async () => {
    await batchRequestPrescription("card-1", ["item-1"], "");

    const callArgs = mockPost.mock.calls[0][1];
    expect(callArgs).not.toHaveProperty("doctorUserId");
  });

  it("debe retornar el BatchRequestResult del servidor", async () => {
    const result = await batchRequestPrescription("card-1", ["item-1"], "doctor-123");
    expect(result).toEqual(mockBatchResult);
  });

  it("debe funcionar con un solo item", async () => {
    await batchRequestPrescription("card-1", ["item-solo"], "doctor-1");

    expect(mockPost).toHaveBeenCalledWith(
      "/green-cards/card-1/batch-request-prescription",
      { itemIds: ["item-solo"], doctorUserId: "doctor-1" }
    );
  });
});

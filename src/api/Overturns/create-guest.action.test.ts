import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPost = vi.hoisted(() => vi.fn());

vi.mock("@/services/axiosConfig", () => ({
  apiTurnos: { post: mockPost },
}));

import { createGuestOverturn } from "./create-guest.action";

const baseDto = {
  doctorId: 388,
  date: "2026-11-20",
  hour: "12:00",
  guestDocumentNumber: "30111222",
  guestFirstName: "Emma",
  guestLastName: "Orazi",
  guestPhone: "3411234567",
};

describe("createGuestOverturn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPost.mockResolvedValue({ data: {} });
  });

  it("pasa el tipo de consulta al backend cuando viene", async () => {
    await createGuestOverturn({ ...baseDto, consultationTypeId: 900 });

    expect(mockPost).toHaveBeenCalledWith(
      "overturns/guest",
      expect.objectContaining({ documentNumber: "30111222", consultationTypeId: 900 }),
    );
  });

  it("no manda consultationTypeId si no se eligió", async () => {
    await createGuestOverturn(baseDto);

    const body = mockPost.mock.calls[0][1] as Record<string, unknown>;
    expect(body).not.toHaveProperty("consultationTypeId");
  });
});

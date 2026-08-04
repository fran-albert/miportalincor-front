import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGet = vi.hoisted(() => vi.fn());
const mockPut = vi.hoisted(() => vi.fn());
const mockPost = vi.hoisted(() => vi.fn());

vi.mock("@/services/axiosConfig", () => ({
  apiIncorHC: {
    get: mockGet,
    put: mockPut,
    post: mockPost,
  },
}));

import {
  getProgramMonthlyPlan,
  sendProgramMonthlyPlanWhatsapp,
  upsertProgramMonthlyPlan,
} from "./program-monthly-plans.actions";
import { ProgramMonthlyWhatsappStatus } from "@/types/Program/ProgramMonthlyPlan";

const response = {
  persisted: true,
  enrollmentId: "enrollment-1",
  periodYear: 2026,
  periodMonth: 7,
  programMonthNumber: 1,
  programName: "Programa",
  discountBasisPoints: 1000,
  discountPercent: 10,
  listTotalCents: "12500000",
  discountAmountCents: "1250000",
  discountedTotalCents: "11250000",
  revision: 1,
  whatsappStatus: ProgramMonthlyWhatsappStatus.DISABLED,
  activities: [],
};

describe("program monthly plan actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("usa los endpoints publicados por feature 380", async () => {
    mockGet.mockResolvedValue({ data: response });
    mockPut.mockResolvedValue({ data: response });
    mockPost.mockResolvedValue({ data: response });

    await getProgramMonthlyPlan("enrollment-1", 2026, 7);
    await upsertProgramMonthlyPlan("enrollment-1", 2026, 7, {
      activities: [{ activityId: "nutrition", quantity: 3 }],
    });
    await sendProgramMonthlyPlanWhatsapp("enrollment-1", 2026, 7);

    const base = "/enrollments/enrollment-1/monthly-plans/2026/7";
    expect(mockGet).toHaveBeenCalledWith(base);
    expect(mockPut).toHaveBeenCalledWith(base, {
      activities: [{ activityId: "nutrition", quantity: 3 }],
    });
    expect(mockPost).toHaveBeenCalledWith(`${base}/whatsapp`);
  });

  it("rechaza importes que no sean strings decimales exactos", async () => {
    mockGet.mockResolvedValue({
      data: { ...response, discountedTotalCents: "112500.00" },
    });

    await expect(
      getProgramMonthlyPlan("enrollment-1", 2026, 7)
    ).rejects.toThrow("cadena decimal de centavos");
  });
});

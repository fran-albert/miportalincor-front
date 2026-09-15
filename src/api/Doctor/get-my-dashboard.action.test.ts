import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGet = vi.hoisted(() => vi.fn());

vi.mock("@/services/axiosConfig", () => ({
  apiTurnos: { get: mockGet },
}));

import {
  getDoctorDashboardById,
  getMyDashboard,
  type DoctorDashboardParams,
} from "./get-my-dashboard.action";

describe("doctor dashboard API", () => {
  const params: DoctorDashboardParams = {
    dateFrom: "2026-09-14",
    dateTo: "2026-09-20",
    selectedWeekStart: "2026-09-14",
    selectedWeekEnd: "2026-09-20",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({ data: { calendarAppointments: [] } });
  });

  it("passes AbortSignal to the selected doctor's Axios request", async () => {
    const controller = new AbortController();

    await getDoctorDashboardById(42, params, controller.signal);

    expect(mockGet).toHaveBeenCalledWith("/doctors/42/dashboard", {
      params,
      signal: controller.signal,
    });
  });

  it("passes AbortSignal to the logged-in doctor's Axios request", async () => {
    const controller = new AbortController();

    await getMyDashboard(params, controller.signal);

    expect(mockGet).toHaveBeenCalledWith("/doctors/me/dashboard", {
      params,
      signal: controller.signal,
    });
  });
});

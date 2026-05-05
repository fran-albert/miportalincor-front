import { describe, expect, it } from "vitest";
import {
  formatOperationsDate,
  getOperationsStatusClass,
  getOperationsStatusLabel,
  getVisibleOperationsDoctors,
} from "../operationsTodayDashboard.utils";
import type { OperationsTodayDoctor } from "@/types/Operations/TodayDashboard";

const createDoctor = (
  overrides: Partial<OperationsTodayDoctor>
): OperationsTodayDoctor => ({
  doctorId: 1,
  doctorName: "Lopez, Ana",
  isWorkingToday: false,
  hasRemainingWorkingHours: false,
  appointments: 0,
  overturns: 0,
  waiting: 0,
  called: 0,
  attending: 0,
  completed: 0,
  noShow: 0,
  status: "idle",
  ...overrides,
});

describe("operationsTodayDashboard utils", () => {
  it("formats the dashboard date in Argentina timezone", () => {
    expect(formatOperationsDate("2026-05-04")).toContain("lunes");
    expect(formatOperationsDate("2026-05-04")).toContain("04");
  });

  it("translates operational statuses", () => {
    expect(getOperationsStatusLabel("WAITING")).toBe("En espera");
    expect(getOperationsStatusLabel("ATTENDING")).toBe("Atendiendo");
  });

  it("keeps doctors visible only when they work today or have activity", () => {
    const doctors = [
      createDoctor({
        doctorId: 1,
        isWorkingToday: true,
        hasRemainingWorkingHours: true,
        status: "working",
      }),
      createDoctor({ doctorId: 2, waiting: 1, status: "with_activity" }),
      createDoctor({
        doctorId: 3,
        appointments: 1,
        nextEventHour: "18:00",
        status: "with_activity",
      }),
      createDoctor({ doctorId: 4, isWorkingToday: true, appointments: 1 }),
      createDoctor({ doctorId: 5 }),
    ];

    expect(getVisibleOperationsDoctors(doctors).map((doctor) => doctor.doctorId))
      .toEqual([1, 2, 3]);
  });

  it("uses red styles for cancelled statuses", () => {
    expect(getOperationsStatusClass("CANCELLED_BY_SECRETARY")).toContain("bg-red-100");
    expect(getOperationsStatusClass("CANCELLED_BY_PATIENT")).toContain("text-red-800");
  });
});

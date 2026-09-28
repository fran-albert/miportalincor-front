import { describe, expect, it } from "vitest";
import { formatPlanCalendarDate } from "./plan-schedule.helpers";

describe("formatPlanCalendarDate", () => {
  it("formatea una fecha calendario sin pasar por Date", () => {
    expect(formatPlanCalendarDate("2026-09-02")).toBe("02/09/2026");
  });

  it("usa la parte de fecha si viene con hora", () => {
    expect(formatPlanCalendarDate("2026-09-02T00:00:00.000Z")).toBe(
      "02/09/2026"
    );
  });

  it("devuelve un guion si no hay fecha", () => {
    expect(formatPlanCalendarDate(null)).toBe("-");
    expect(formatPlanCalendarDate(undefined)).toBe("-");
    expect(formatPlanCalendarDate("")).toBe("-");
  });
});

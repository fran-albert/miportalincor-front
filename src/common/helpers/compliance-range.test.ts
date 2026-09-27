import { describe, expect, it } from "vitest";
import {
  COMPLIANCE_RANGE_PRESETS,
  DEFAULT_COMPLIANCE_RANGE,
  formatCompliancePercent,
  getComplianceRange,
  getExtraSessions,
} from "./compliance-range.helpers";

// Reporte de Virginia Butikofer (2026-09-10): "miro el mes y dice 5 de 5 y en
// realidad recién arranca septiembre". El preset "Último mes" era hoy-30 →
// hoy, así que el 10/09 contaba asistencias desde el 11/08.
describe("getComplianceRange", () => {
  const september10 = new Date(2026, 8, 10, 9, 55);

  it("uses the current calendar month by default, from the 1st to the last day", () => {
    expect(DEFAULT_COMPLIANCE_RANGE).toBe("month");
    expect(getComplianceRange("month", september10)).toEqual({
      from: "2026-09-01",
      to: "2026-09-30",
    });
  });

  it("labels the default preset as the current month", () => {
    expect(COMPLIANCE_RANGE_PRESETS.map((preset) => preset.label)).toEqual([
      "Este mes",
      "Últimos 3 meses",
      "Último año",
    ]);
  });

  it("aligns the longer presets to whole calendar months", () => {
    expect(getComplianceRange("3months", september10)).toEqual({
      from: "2026-07-01",
      to: "2026-09-30",
    });
    expect(getComplianceRange("year", september10)).toEqual({
      from: "2025-10-01",
      to: "2026-09-30",
    });
  });

  it("handles months with 31 and 28 days", () => {
    expect(getComplianceRange("month", new Date(2026, 7, 31))).toEqual({
      from: "2026-08-01",
      to: "2026-08-31",
    });
    expect(getComplianceRange("month", new Date(2027, 1, 1))).toEqual({
      from: "2027-02-01",
      to: "2027-02-28",
    });
  });
});

describe("compliance display", () => {
  it("caps the visible percentage at 100 when attendances exceed the plan", () => {
    expect(formatCompliancePercent(150)).toBe("100%");
    expect(formatCompliancePercent(66.7)).toBe("67%");
  });

  it("counts the sessions over the plan only when there is a plan", () => {
    expect(getExtraSessions({ attended: 3, expected: 2 })).toBe(1);
    expect(getExtraSessions({ attended: 2, expected: 4 })).toBe(0);
    expect(getExtraSessions({ attended: 3, expected: 0 })).toBe(0);
  });
});

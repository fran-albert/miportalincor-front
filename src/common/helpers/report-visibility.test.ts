import { describe, expect, it } from "vitest";
import { normalizeReportVisibilityOverrides } from "./report-visibility";

describe("normalizeReportVisibilityOverrides", () => {
  it("removes automatic values and keeps explicit overrides", () => {
    expect(
      normalizeReportVisibilityOverrides({
        genitourinary: "automatic",
        genitourinary_gyn_ob: "force_hide",
      })
    ).toEqual({
      genitourinary_gyn_ob: "force_hide",
    });
  });

  it("returns an empty object when overrides are nullish", () => {
    expect(normalizeReportVisibilityOverrides(undefined)).toEqual({});
    expect(normalizeReportVisibilityOverrides(null)).toEqual({});
  });
});

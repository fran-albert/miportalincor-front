import { describe, expect, it } from "vitest";
import {
  normalizeReportVisibilityOverrides,
  resolveReportVisibility,
} from "./report-visibility";

describe("normalizeReportVisibilityOverrides", () => {
  it("removes automatic values and keeps only supported explicit overrides", () => {
    expect(
      normalizeReportVisibilityOverrides({
        genitourinary: "force_show",
        genitourinary_gyn_ob: "force_hide",
      })
    ).toEqual({
      genitourinary: "force_show",
    });
  });

  it("returns an empty object when overrides are nullish", () => {
    expect(normalizeReportVisibilityOverrides(undefined)).toEqual({});
    expect(normalizeReportVisibilityOverrides(null)).toEqual({});
  });
});

describe("resolveReportVisibility", () => {
  it("always resolves gineco-obstetric visibility automatically", () => {
    expect(
      resolveReportVisibility({
        sectionKey: "genitourinary_gyn_ob",
        visibilityMode: "force_hide",
        collaboratorGender: "femenino",
        hasData: true,
      })
    ).toMatchObject({
      visibilityMode: "automatic",
      resolvedVisibility: "visible",
      reason: "has_data",
    });

    expect(
      resolveReportVisibility({
        sectionKey: "genitourinary_gyn_ob",
        visibilityMode: "force_show",
        collaboratorGender: "femenino",
        hasData: false,
      })
    ).toMatchObject({
      visibilityMode: "automatic",
      resolvedVisibility: "hidden",
      reason: "empty_section",
    });
  });
});

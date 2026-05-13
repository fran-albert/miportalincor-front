import { describe, expect, it } from "vitest";

import { VaccinationApplicationSchema } from "./vaccination.schema";

describe("VaccinationApplicationSchema", () => {
  it("requires a schedule rule and application date", () => {
    const result = VaccinationApplicationSchema.safeParse({
      scheduleRuleId: "",
      appliedDate: "",
      observations: "Control",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.scheduleRuleId).toContain(
        "Selecciona una vacuna y dosis"
      );
      expect(result.error.flatten().fieldErrors.appliedDate).toContain(
        "La fecha de aplicacion es requerida"
      );
    }
  });

  it("accepts a controlled dose with an optional observation", () => {
    const result = VaccinationApplicationSchema.safeParse({
      scheduleRuleId: "rule-uuid",
      appliedDate: "2026-05-13",
      observations: "Sin reacciones",
    });

    expect(result.success).toBe(true);
  });
});

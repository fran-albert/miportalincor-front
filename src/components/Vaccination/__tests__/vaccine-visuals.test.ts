import { Syringe, Thermometer } from "lucide-react";
import { describe, expect, it } from "vitest";

import {
  DEFAULT_VACCINE_VISUAL,
  getVaccineVisual,
} from "../vaccine-visuals";

const CATALOG_CODES = [
  "bcg",
  "hepatitis_b",
  "neumococo_conjugada",
  "rotavirus",
  "quintuple_pentavalente",
  "ipv_salk",
  "meningococo",
  "gripe",
  "hepatitis_a",
  "triple_viral",
  "varicela",
  "triple_bacteriana_celular",
  "vph",
  "dtpa",
];

describe("getVaccineVisual", () => {
  it("asigna icono y color propios a una vacuna conocida", () => {
    const visual = getVaccineVisual("gripe");

    expect(visual.icon).toBe(Thermometer);
    expect(visual.badgeClassName).toContain("sky");
  });

  it("cubre las 14 vacunas del catalogo actual sin caer en el default", () => {
    for (const code of CATALOG_CODES) {
      expect(getVaccineVisual(code)).not.toBe(DEFAULT_VACCINE_VISUAL);
    }
  });

  it("usa un default para codigos nuevos o vacios", () => {
    expect(getVaccineVisual("covid_19")).toBe(DEFAULT_VACCINE_VISUAL);
    expect(getVaccineVisual(undefined)).toBe(DEFAULT_VACCINE_VISUAL);
    expect(DEFAULT_VACCINE_VISUAL.icon).toBe(Syringe);
  });

  it("no depende de mayusculas ni espacios en el codigo", () => {
    expect(getVaccineVisual(" GRIPE ")).toBe(getVaccineVisual("gripe"));
  });
});

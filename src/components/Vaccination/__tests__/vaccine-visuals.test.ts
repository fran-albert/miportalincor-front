import { Syringe, Thermometer } from "lucide-react";
import { describe, expect, it } from "vitest";

import {
  DEFAULT_VACCINE_VISUAL,
  formatDoseLabel,
  getVaccineDescription,
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

describe("getVaccineDescription", () => {
  it("usa la aclaracion con tildes del mapa para los codigos del catalogo", () => {
    expect(
      getVaccineDescription("triple_viral", "Sarampion, rubeola y paperas")
    ).toBe("Sarampión, rubéola y paperas");
    expect(getVaccineDescription("neumococo_conjugada", "x")).toBe(
      "Enfermedad neumocócica"
    );
    expect(getVaccineDescription("dtpa", "Triple bacteriana acelular")).toBe(
      "Difteria, tétanos y tos convulsa (acelular)"
    );
  });

  it("tiene aclaracion para los 14 codigos del catalogo", () => {
    for (const code of CATALOG_CODES) {
      expect(getVaccineDescription(code, undefined)).toBeTruthy();
    }
  });

  it("si el codigo no esta en el mapa, muestra la descripcion de la API", () => {
    expect(getVaccineDescription("covid_19", "SARS-CoV-2")).toBe("SARS-CoV-2");
    expect(getVaccineDescription("covid_19", undefined)).toBeUndefined();
  });
});

describe("formatDoseLabel", () => {
  it("corrige las etiquetas conocidas del catalogo", () => {
    expect(formatDoseLabel("Unica dosis")).toBe("Única dosis");
    expect(formatDoseLabel("11 anios")).toBe("11 años");
    expect(formatDoseLabel("1ra dosis pediatrica")).toBe("1ra dosis pediátrica");
    expect(formatDoseLabel("2da dosis pediatrica si corresponde")).toBe(
      "2da dosis pediátrica"
    );
  });

  it("deja cualquier otra etiqueta tal cual", () => {
    expect(formatDoseLabel("1ra dosis")).toBe("1ra dosis");
    expect(formatDoseLabel("Refuerzo ingreso escolar")).toBe(
      "Refuerzo ingreso escolar"
    );
    expect(formatDoseLabel("Dosis anual")).toBe("Dosis anual");
  });
});

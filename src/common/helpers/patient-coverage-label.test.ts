import { describe, expect, it } from "vitest";
import { buildPatientCoverageLabel } from "./patient-coverage-label";

describe("la cobertura del paciente en el bloque del turno", () => {
  it("muestra obra social y número de afiliado cuando están los dos", () => {
    expect(buildPatientCoverageLabel("OSDE", "12345")).toBe("OSDE 12345");
  });

  it("🔴 sin obra social muestra solo el número, nunca 'undefined'", () => {
    const label = buildPatientCoverageLabel(undefined, "12345");

    expect(label).toBe("12345");
    expect(label).not.toContain("undefined");
  });

  it("sin número de afiliado muestra solo la obra social", () => {
    expect(buildPatientCoverageLabel("OSDE", undefined)).toBe("OSDE");
  });

  it("sin ninguno de los dos devuelve vacío, para que no se renderice", () => {
    expect(buildPatientCoverageLabel(undefined, undefined)).toBe("");
    expect(buildPatientCoverageLabel("", "")).toBe("");
  });
});

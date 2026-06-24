import { describe, expect, it } from "vitest";
import {
  hasLaboralCapabilities,
  LABORAL_CAPABILITIES,
  LABORAL_ROLE_NAME,
  resolveLaboralCapabilities,
} from "../laboral-permissions";

describe("resolveLaboralCapabilities", () => {
  it("otorga todo a Administrador", () => {
    const capabilities = resolveLaboralCapabilities(["Administrador"]);

    expect(capabilities.has(LABORAL_CAPABILITIES.ACCESS)).toBe(true);
    expect(capabilities.has(LABORAL_CAPABILITIES.REPORT_CONFIG_WRITE)).toBe(true);
    expect(capabilities.has(LABORAL_CAPABILITIES.EXAMS_DELETE)).toBe(true);
  });

  it("no otorga acceso laboral sin el rol Laboral", () => {
    const secretaryCapabilities = resolveLaboralCapabilities(["Secretaria"]);
    const doctorCapabilities = resolveLaboralCapabilities(["Medico"]);

    expect(secretaryCapabilities.size).toBe(0);
    expect(doctorCapabilities.size).toBe(0);
  });

  it("otorga permisos operativos a Secretaria + Laboral", () => {
    const capabilities = resolveLaboralCapabilities([
      "Secretaria",
      LABORAL_ROLE_NAME,
    ]);

    expect(capabilities.has(LABORAL_CAPABILITIES.ACCESS)).toBe(true);
    expect(capabilities.has(LABORAL_CAPABILITIES.COMPANIES_WRITE)).toBe(true);
    expect(capabilities.has(LABORAL_CAPABILITIES.COLLABORATORS_WRITE)).toBe(
      true
    );
    expect(capabilities.has(LABORAL_CAPABILITIES.EXAMS_WRITE)).toBe(true);
    expect(capabilities.has(LABORAL_CAPABILITIES.EXAMS_DELETE)).toBe(true);
    expect(capabilities.has(LABORAL_CAPABILITIES.REPORT_CONFIG_READ)).toBe(
      false
    );
    expect(capabilities.has(LABORAL_CAPABILITIES.REPORT_CONFIG_WRITE)).toBe(
      false
    );
  });

  it("otorga permisos clínicos a Medico + Laboral sin delete ni config", () => {
    const capabilities = resolveLaboralCapabilities(["Medico", LABORAL_ROLE_NAME]);

    expect(capabilities.has(LABORAL_CAPABILITIES.ACCESS)).toBe(true);
    expect(capabilities.has(LABORAL_CAPABILITIES.COMPANIES_READ)).toBe(true);
    expect(capabilities.has(LABORAL_CAPABILITIES.COLLABORATORS_READ)).toBe(true);
    expect(capabilities.has(LABORAL_CAPABILITIES.COMPANIES_WRITE)).toBe(false);
    expect(capabilities.has(LABORAL_CAPABILITIES.COLLABORATORS_WRITE)).toBe(
      false
    );
    expect(capabilities.has(LABORAL_CAPABILITIES.EXAMS_WRITE)).toBe(true);
    expect(capabilities.has(LABORAL_CAPABILITIES.EXAMS_DELETE)).toBe(false);
    expect(capabilities.has(LABORAL_CAPABILITIES.REPORT_CONFIG_READ)).toBe(
      false
    );
  });
});

describe("hasLaboralCapabilities", () => {
  it("requiere que todas las capacidades estén presentes", () => {
    expect(
      hasLaboralCapabilities(
        ["Secretaria", LABORAL_ROLE_NAME],
        [
          LABORAL_CAPABILITIES.ACCESS,
          LABORAL_CAPABILITIES.EXAMS_WRITE,
          LABORAL_CAPABILITIES.REPORTS_GENERATE,
        ]
      )
    ).toBe(true);

    expect(
      hasLaboralCapabilities(
        ["Medico", LABORAL_ROLE_NAME],
        [
          LABORAL_CAPABILITIES.ACCESS,
          LABORAL_CAPABILITIES.EXAMS_DELETE,
        ]
      )
    ).toBe(false);
  });
});

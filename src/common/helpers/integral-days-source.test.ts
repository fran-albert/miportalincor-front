import { describe, expect, it } from "vitest";

import { integralDaysSource } from "./integral-days-source";

/**
 * Cuál de los dos listados de días del control se pregunta.
 *
 * 🔴 Hay DOS endpoints y CUATRO roles, así que la cuenta nunca cierra por
 * negación: preguntar "¿no es paciente?" mandaba a la médica al endpoint de
 * secretaría —que le contestaba 403— y dejaba el listado muerto. La decisión
 * es por **capacidad**: ¿este usuario mira la grilla del personal o la suya?
 * Los roles del personal se enumeran acá, en un solo lugar; el que no está en
 * la lista NO hereda la grilla del personal.
 */
describe("integralDaysSource", () => {
  it("la secretaria mira la grilla del personal", () => {
    expect(integralDaysSource({ isSecretary: true })).toBe("staff");
  });

  it("administración también", () => {
    expect(integralDaysSource({ isAdmin: true })).toBe("staff");
  });

  it("la médica también: desde su agenda mueve el control, no lo pide", () => {
    expect(integralDaysSource({ isDoctor: true })).toBe("staff");
  });

  it("la paciente mira la suya", () => {
    expect(integralDaysSource({ isPatient: true })).toBe("patient");
  });

  it("una médica que además es paciente de la clínica mira la del personal", () => {
    expect(integralDaysSource({ isDoctor: true, isPatient: true })).toBe(
      "staff",
    );
  });

  it("un rol que este front todavía no conoce NO hereda la del personal", () => {
    // Es el bug que rompió esto: sumar un rol y que caiga en el endpoint de
    // secretaría por descarte, con un 403 que nadie pidió. Sumar un rol del
    // personal es sumarlo a la lista de arriba, en un solo archivo.
    expect(integralDaysSource({})).toBe("patient");
  });

  it("sin sesión tampoco: la grilla del personal se pide explícitamente", () => {
    expect(
      integralDaysSource({
        isPatient: false,
        isDoctor: false,
        isSecretary: false,
        isAdmin: false,
      }),
    ).toBe("patient");
  });
});

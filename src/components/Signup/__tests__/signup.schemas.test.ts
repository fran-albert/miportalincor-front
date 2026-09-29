import { describe, expect, it } from "vitest";
import {
  buildHealthInsuranceSchema,
  buildPasswordSchema,
  dniSchema,
  maskBirthDateInput,
  normalizeArgentineMobile,
  parseBirthDate,
  personalSchema,
} from "../signup.schemas";

describe("validaciones del alta", () => {
  it("DNI: 7 u 8 números; acepta puntos y los saca", () => {
    expect(dniSchema.safeParse({ dni: "30.111.222" }).success).toBe(true);
    expect(dniSchema.safeParse({ dni: "1234567" }).success).toBe(true);
    expect(dniSchema.safeParse({ dni: "123456" }).success).toBe(false);
    expect(dniSchema.safeParse({ dni: "123456789" }).success).toBe(false);
    expect(dniSchema.safeParse({ dni: "12a45678" }).success).toBe(false);
  });

  it("celular argentino: característica + número, sin 0 ni 15", () => {
    expect(normalizeArgentineMobile("341 555-1234")).toBe("3415551234");
    expect(normalizeArgentineMobile("+54 9 341 555 1234")).toBe("3415551234");
    expect(normalizeArgentineMobile("0341 555 1234")).toBeNull();
    expect(normalizeArgentineMobile("155551234")).toBeNull();
    expect(normalizeArgentineMobile("5551234")).toBeNull();
  });

  it("fecha de nacimiento DD/MM/AAAA: existe, no es futura", () => {
    expect(parseBirthDate("15/06/1991")).toBe("1991-06-15");
    expect(parseBirthDate("31/02/1991")).toBeNull();
    expect(parseBirthDate("1991-06-15")).toBeNull();
    expect(maskBirthDateInput("15061991")).toBe("15/06/1991");
    const base = {
      firstName: "Lucía",
      lastName: "Prueba",
      phone: "3415551234",
      email: "",
    };
    expect(personalSchema.safeParse({ ...base, birthDate: "15/06/1991" }).success).toBe(true);
    expect(personalSchema.safeParse({ ...base, birthDate: "15/06/2999" }).success).toBe(false);
    expect(
      personalSchema.safeParse({ ...base, birthDate: "15/06/1991", email: "no-es" }).success
    ).toBe(false);
  });

  it("obra social obligatoria; afiliado obligatorio salvo PARTICULAR", () => {
    const osde = buildHealthInsuranceSchema({ requiresAffiliationNumber: true });
    const particular = buildHealthInsuranceSchema({ requiresAffiliationNumber: false });
    const none = buildHealthInsuranceSchema(null);

    expect(
      none.safeParse({ healthInsuranceId: null, healthPlanId: null, affiliationNumber: "" })
        .success
    ).toBe(false);
    expect(
      osde.safeParse({ healthInsuranceId: 1, healthPlanId: 1, affiliationNumber: "" }).success
    ).toBe(false);
    for (const garbage of ["ab1", "12 34", "$$$$1234", "asdfgh", "----"]) {
      expect(
        osde.safeParse({ healthInsuranceId: 1, healthPlanId: 1, affiliationNumber: garbage })
          .success
      ).toBe(false);
    }
    expect(
      osde.safeParse({
        healthInsuranceId: 1,
        healthPlanId: 1,
        affiliationNumber: " 61-234/567 ",
      }).success
    ).toBe(true);
    expect(
      osde.safeParse({ healthInsuranceId: 1, healthPlanId: null, affiliationNumber: "6123" })
        .success
    ).toBe(false);
    expect(
      particular.safeParse({ healthInsuranceId: 40, healthPlanId: 40, affiliationNumber: "" })
        .success
    ).toBe(true);
  });

  it("contraseña: 8 o más, distinta del DNI y repetida igual", () => {
    const schema = buildPasswordSchema("30111222");
    expect(schema.safeParse({ password: "corta", confirmPassword: "corta" }).success).toBe(false);
    expect(
      schema.safeParse({ password: "30111222", confirmPassword: "30111222" }).success
    ).toBe(false);
    expect(
      schema.safeParse({ password: "clave-segura", confirmPassword: "otra-cosa" }).success
    ).toBe(false);
    expect(
      schema.safeParse({ password: "clave-segura", confirmPassword: "clave-segura" }).success
    ).toBe(true);
  });
});

// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";

import { collaboratorSchema } from "./collaborator.schema";

const validCollaborator = {
  firstName: "Juan",
  lastName: "Perez",
  positionJob: "Administrativo",
  userName: "12345678",
  birthDate: "1985-04-10",
  phone: "3415551234",
  gender: "Masculino",
  email: "",
  idCompany: "1",
  address: {
    street: "San Martin",
    number: "123",
    description: "",
    phoneNumber: "",
    city: {
      id: 1,
      name: "Rosario",
      state: {
        id: 1,
        name: "Santa Fe",
        country: {
          id: 1,
          name: "Argentina",
        },
      },
    },
  },
};

describe("collaboratorSchema", () => {
  it("acepta DNI laborales de 6 a 10 digitos", () => {
    for (const userName of ["123456", "1234567", "12345678", "1234567890"]) {
      const result = collaboratorSchema.safeParse({
        ...validCollaborator,
        userName,
      });

      expect(result.success).toBe(true);
    }
  });

  it("rechaza DNI laborales fuera de rango o no numericos", () => {
    for (const userName of ["12345", "12345678901", "12.345.678", "ABC123"]) {
      const result = collaboratorSchema.safeParse({
        ...validCollaborator,
        userName,
      });

      expect(result.success).toBe(false);
    }
  });
});

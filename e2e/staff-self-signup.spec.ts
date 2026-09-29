import { expect, Page, test } from "@playwright/test";
import { HC_ORIGIN, fakeJwt, json, loginAs, mockApis } from "./helpers";

// Datos ficticios: nunca un paciente real.
const selfSignupPatient = (verifiedAt: string | null) => ({
  id: "uuid-7001",
  userId: 7001,
  userName: "40200200",
  dni: "40200200",
  firstName: "Lucía",
  lastName: "Prueba",
  email: "lucia.prueba@example.com",
  phoneNumber: "3415551234",
  birthDate: "1991-06-15",
  gender: "Femenino",
  affiliationNumber: "61234567801",
  healthPlans: [
    { id: 1, name: "Plan 210", healthInsurance: { id: 1, name: "OSDE" } },
  ],
  address: {
    id: 1,
    street: "Calle Ficticia",
    number: "123",
    description: "2° B",
    city: {
      id: 2104,
      name: "Rosario",
      state: { id: 22, name: "Santa Fe", country: { id: 1, name: "Argentina" } },
    },
  },
  roles: ["Paciente"],
  registrationSource: "SELF_SIGNUP",
  verifiedAt,
});

const staffPatient = {
  ...selfSignupPatient(null),
  id: "uuid-5000",
  userId: 5000,
  userName: "30111222",
  dni: "30111222",
  firstName: "Carlos",
  lastName: "Ejemplo",
  email: "carlos.ejemplo@example.com",
  registrationSource: "STAFF",
  verifiedAt: null,
};

const page1 = (data: unknown[]) => ({
  data,
  total: data.length,
  page: 1,
  limit: 10,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
});

interface StaffState {
  verifiedAt: string | null;
  verifyCalls: number;
  searchQueries: string[];
}

const setupStaff = async (page: Page, roles: string[]): Promise<StaffState> => {
  const state: StaffState = { verifiedAt: null, verifyCalls: 0, searchQueries: [] };
  await loginAs(page, fakeJwt({ id: "SEC-001", roles, firstName: "Recepción", lastName: "Incor" }));
  await mockApis(page, {
    [`GET ${HC_ORIGIN}/patient/search`]: (route) => {
      const url = new URL(route.request().url());
      state.searchQueries.push(url.search);
      const self = selfSignupPatient(state.verifiedAt);
      if (url.searchParams.get("registration") === "self-unverified") {
        return json(route, page1(state.verifiedAt ? [] : [self]));
      }
      return json(route, page1([self, staffPatient]));
    },
    [`GET ${HC_ORIGIN}/patient/by-user-id/7001`]: (route) =>
      json(route, selfSignupPatient(state.verifiedAt)),
    [`GET ${HC_ORIGIN}/patient/by-user-id/5000`]: (route) => json(route, staffPatient),
    [`PATCH ${HC_ORIGIN}/patient/7001/verify`]: (route) => {
      state.verifyCalls++;
      state.verifiedAt = "2026-09-29T13:00:00.000Z";
      return json(route, selfSignupPatient(state.verifiedAt));
    },
  });
  return state;
};

test.describe("Recepción: autoregistrados", () => {
  test("la lista muestra el distintivo y el filtro 'Autoregistro sin verificar' trae solo esos", async ({
    page,
  }) => {
    const state = await setupStaff(page, ["Secretaria"]);
    await page.goto("/pacientes");

    await page.getByPlaceholder("Buscar pacientes...").fill("e");
    const selfRow = page.getByRole("row", { name: /Prueba, Lucía/ });
    await expect(selfRow.getByTestId("self-signup-badge")).toHaveText(
      "Autoregistro · revisar datos"
    );
    const staffRow = page.getByRole("row", { name: /Ejemplo, Carlos/ });
    await expect(staffRow).toBeVisible();
    await expect(staffRow.getByTestId("self-signup-badge")).toHaveCount(0);

    await page.getByPlaceholder("Buscar pacientes...").fill("");
    await page.getByTestId("self-signup-filter").click();
    await expect(page.getByTestId("self-signup-filter")).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("row", { name: /Prueba, Lucía/ })).toBeVisible();
    await expect(page.getByRole("row", { name: /Ejemplo, Carlos/ })).toHaveCount(0);
    expect(state.searchQueries.some((q) => q.includes("registration=self-unverified"))).toBe(
      true
    );
  });

  test("en la ficha, 'Datos verificados' pide confirmar DNI y credencial y saca el distintivo", async ({
    page,
  }) => {
    const state = await setupStaff(page, ["Secretaria"]);
    await page.goto("/pacientes/lucia-prueba-7001");

    await expect(page.getByTestId("self-signup-badge")).toHaveText(
      "Autoregistro · revisar datos"
    );
    // La secretaria no ve desactivar: es solo de Admin.
    await expect(page.getByTestId("deactivate-self-signup")).toHaveCount(0);

    await page.getByTestId("verify-self-signup").click();
    const confirm = page.getByTestId("verify-self-signup-confirm");
    await expect(confirm).toBeDisabled();
    await page.getByLabel("Vi el DNI del paciente").click();
    await page.getByLabel("Vi la credencial de la obra social").click();
    await confirm.click();

    await expect(page.getByTestId("self-signup-badge")).toHaveCount(0);
    await expect(page.getByTestId("verify-self-signup")).toHaveCount(0);
    expect(state.verifyCalls).toBe(1);
  });

  test("el admin ve además 'El DNI no es de esta persona'", async ({ page }) => {
    await setupStaff(page, ["Administrador"]);
    await page.goto("/pacientes/lucia-prueba-7001");
    await expect(page.getByTestId("verify-self-signup")).toBeVisible();
    await page.getByTestId("deactivate-self-signup").click();
    await expect(page.getByRole("heading", { name: "Desactivar cuenta" })).toBeVisible();
    await expect(page.getByTestId("deactivate-self-signup-confirm")).toBeDisabled();
  });

  test("un médico ve el distintivo pero no el botón", async ({
    page,
  }) => {
    await setupStaff(page, ["Medico"]);
    await page.goto("/pacientes/lucia-prueba-7001");
    await expect(page.getByTestId("self-signup-badge")).toBeVisible();
    await expect(page.getByTestId("verify-self-signup")).toHaveCount(0);
  });

  test("un rol Paciente no ve el botón (no accede a la ficha del personal)", async ({
    page,
  }) => {
    await setupStaff(page, ["Paciente"]);
    await page.goto("/pacientes/lucia-prueba-7001");
    await expect(page).toHaveURL(/acceso-denegado/);
    await expect(page.getByTestId("verify-self-signup")).toHaveCount(0);
  });

  test("un paciente cargado por secretaría no muestra el distintivo", async ({ page }) => {
    await setupStaff(page, ["Secretaria"]);
    await page.goto("/pacientes/carlos-ejemplo-5000");
    await expect(page.getByRole("heading", { name: "Carlos Ejemplo" }).first()).toBeVisible();
    await expect(page.getByTestId("self-signup-badge")).toHaveCount(0);
  });
});

import { expect, Page, test } from "@playwright/test";
import {
  CITIES_SANTA_FE,
  HC_ORIGIN,
  HEALTH_INSURANCES,
  STATES,
  TURNOS_ORIGIN,
  fakeJwt,
  json,
  mockApis,
} from "./helpers";

// Datos ficticios: nunca un paciente real.
const DNI = "40200200";
const PREFILL = {
  dni: DNI,
  firstName: "Lucía",
  lastName: "Prueba",
  phone: "3415551234",
  email: "lucia.prueba@example.com",
};

const daysFromToday = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const LINKED_APPOINTMENT = {
  id: 501,
  doctorId: 12,
  patientId: 7001,
  date: daysFromToday(6),
  hour: "10:00:00",
  status: "PENDING",
  isGuest: false,
  origin: "WEB_GUEST",
  doctor: {
    userId: 12,
    firstName: "ANA",
    lastName: "EJEMPLO",
    specialities: [{ id: 1, name: "Cardiología" }],
  },
};

interface Captured {
  complete?: Record<string, unknown>;
}

const setup = async (
  page: Page,
  options: {
    prefill?: "ok" | "expired";
    hasAccount?: boolean;
  } = {}
): Promise<Captured> => {
  const captured: Captured = {};
  await mockApis(page, {
    [`POST ${HC_ORIGIN}/public/signup/prefill`]: (route) =>
      options.prefill === "ok"
        ? json(route, PREFILL)
        : json(route, { message: "venció", code: "SIGNUP_TOKEN_INVALID" }, 404),
    [`POST ${HC_ORIGIN}/public/signup/check-dni`]: (route) =>
      json(route, { hasAccount: options.hasAccount ?? false }),
    [`GET ${HC_ORIGIN}/public/signup/health-insurances`]: (route) =>
      json(route, HEALTH_INSURANCES),
    [`GET ${HC_ORIGIN}/state`]: (route) => json(route, STATES),
    [`GET ${HC_ORIGIN}/city/by-state/22`]: (route) => json(route, CITIES_SANTA_FE),
    [`POST ${HC_ORIGIN}/public/signup/complete`]: (route) => {
      captured.complete = route.request().postDataJSON() as Record<string, unknown>;
      return json(
        route,
        {
          token: fakeJwt({
            id: "7001",
            roles: ["Paciente"],
            firstName: "Lucía",
            lastName: "Prueba",
          }),
          expiresIn: 3600,
          user: { id: "uuid", email: "", firstName: "Lucía", lastName: "Prueba", roles: ["Paciente"] },
        },
        201
      );
    },
    [`GET ${TURNOS_ORIGIN}/appointments/patient/my-appointments`]: (route) =>
      json(route, [LINKED_APPOINTMENT]),
  });
  return captured;
};

const next = (page: Page) => page.getByTestId("signup-next").click();

const expectStep = (page: Page, label: string) =>
  expect(page.getByTestId("signup-step-label")).toHaveText(label);

const fillDni = async (page: Page, dni = DNI) => {
  await page.getByLabel("DNI").fill(dni);
  await next(page);
};

const fillPersonal = async (page: Page, manual: boolean) => {
  await expectStep(page, "Paso 2 de 5");
  if (manual) {
    await page.getByLabel("Nombre").fill("Lucía");
    await page.getByLabel("Apellido").fill("Prueba");
    await page.getByLabel("Celular").fill("341 555 1234");
  }
  await page.getByLabel("Fecha de nacimiento").fill("15061991");
  await next(page);
};

const chooseInsurance = async (page: Page, name: string, affiliation?: string) => {
  await expectStep(page, "Paso 3 de 5");
  await page.getByPlaceholder("Buscá tu obra social").fill(name.slice(0, 3));
  await page.getByRole("button", { name, exact: true }).click();
  if (affiliation !== undefined) {
    await page.getByLabel("Número de afiliado").fill(affiliation);
  }
  await next(page);
};

const fillAddress = async (page: Page) => {
  await expectStep(page, "Paso 4 de 5");
  await page.getByLabel("Provincia").click();
  await page.getByRole("option", { name: "Santa Fe" }).click();
  await page.getByPlaceholder("Buscá tu ciudad").fill("ros");
  await page.getByRole("button", { name: "Rosario" }).click();
  await page.getByLabel("Calle").fill("Calle Ficticia");
  await page.getByLabel("Número").fill("123");
  await page.getByLabel(/Piso \/ Depto/).fill("2° B");
  await next(page);
};

const fillPassword = async (page: Page) => {
  await expectStep(page, "Paso 5 de 5");
  await page.getByLabel("Contraseña", { exact: true }).fill("clave-segura-1");
  await page.getByLabel("Repetí la contraseña").fill("clave-segura-1");
  await next(page);
};

test.describe("Asistente de alta /registrarse", () => {
  test("con token: DNI bloqueado y datos precargados, termina en Mis turnos con el turno vinculado", async ({
    page,
  }) => {
    const captured = await setup(page, { prefill: "ok" });
    await page.goto("/registrarse#t=token-e2e-123");

    // El token se saca de la barra de direcciones apenas se lee.
    await expect(page).toHaveURL(/\/registrarse$/);
    await expectStep(page, "Paso 1 de 5");
    await expect(page.getByLabel("DNI")).toHaveValue(DNI);
    await expect(page.getByLabel("DNI")).toHaveAttribute("readonly", "");
    await next(page);

    await expect(page.getByLabel("Nombre")).toHaveValue("Lucía");
    await expect(page.getByLabel("Apellido")).toHaveValue("Prueba");
    await expect(page.getByLabel("Celular")).toHaveValue("3415551234");
    await expect(page.getByLabel(/Email/)).toHaveValue("lucia.prueba@example.com");
    await fillPersonal(page, false);
    await chooseInsurance(page, "OSDE", "61234567801");
    await fillAddress(page);
    await fillPassword(page);

    await expect(page.getByRole("heading", { name: "Revisá tus datos" })).toBeVisible();
    await expect(page.getByTestId("summary-dni")).toContainText("40.200.200");
    await expect(page.getByTestId("summary-health")).toContainText("OSDE");
    await expect(page.getByTestId("summary-health")).toContainText("61234567801");
    await page.getByTestId("signup-submit").click();

    await expect(page).toHaveURL(/\/mis-turnos$/);
    await expect(page.getByText(/EJEMPLO/i).first()).toBeVisible();
    expect(captured.complete).toEqual({
      token: "token-e2e-123",
      dni: DNI,
      firstName: "Lucía",
      lastName: "Prueba",
      phone: "3415551234",
      email: "lucia.prueba@example.com",
      birthDate: "1991-06-15",
      healthPlanId: 1,
      affiliationNumber: "61234567801",
      address: {
        cityId: 2104,
        street: "Calle Ficticia",
        number: "123",
        description: "2° B",
      },
      password: "clave-segura-1",
    });
  });

  test("sin token: arranca vacío y se carga todo a mano", async ({ page }) => {
    const captured = await setup(page);
    await page.goto("/registrarse");
    await expect(page.getByLabel("DNI")).toHaveValue("");
    await expect(page.getByLabel("DNI")).not.toHaveAttribute("readonly", "");
    await fillDni(page);
    await expect(page.getByLabel("Nombre")).toHaveValue("");
    await fillPersonal(page, true);
    await chooseInsurance(page, "OSDE", "61234567801");
    await fillAddress(page);
    await fillPassword(page);
    await page.getByTestId("signup-submit").click();
    await expect(page).toHaveURL(/\/mis-turnos$/);
    expect(captured.complete?.token).toBeUndefined();
    expect(captured.complete?.email).toBeUndefined();
    expect(captured.complete?.dni).toBe(DNI);
  });

  test("token vencido: avisa y arranca vacío", async ({ page }) => {
    await setup(page, { prefill: "expired" });
    await page.goto("/registrarse#t=token-vencido");
    await expect(page.getByTestId("signup-token-expired")).toContainText(
      "venció o ya se usó"
    );
    await expect(page.getByLabel("DNI")).toHaveValue("");
    await expect(page.getByLabel("DNI")).not.toHaveAttribute("readonly", "");
  });

  test("DNI con cuenta: 'Ya tenés cuenta' con Iniciar sesión y Olvidé mi contraseña", async ({
    page,
  }) => {
    await setup(page, { hasAccount: true });
    await page.goto("/registrarse");
    await fillDni(page, "30111222");
    await expect(
      page.getByRole("heading", { name: "Ya tenés cuenta en Mi Portal" })
    ).toBeVisible();
    await expect(page.getByTestId("signup-has-account")).toContainText("30.111.222");
    await expect(page.getByRole("link", { name: "Iniciar sesión" })).toHaveAttribute(
      "href",
      "/iniciar-sesion"
    );
    await expect(
      page.getByRole("link", { name: "Olvidé mi contraseña" })
    ).toBeVisible();
    await expect(page.getByText(/acercate a recepción/)).toBeVisible();
  });

  test("PARTICULAR no pide afiliado y la obra social no se puede saltear", async ({
    page,
  }) => {
    const captured = await setup(page);
    await page.goto("/registrarse");
    await fillDni(page);
    await fillPersonal(page, true);

    // Sin elegir, no avanza.
    await next(page);
    await expect(page.getByText("Elegí tu obra social de la lista")).toBeVisible();
    await expectStep(page, "Paso 3 de 5");

    await chooseInsurance(page, "PARTICULAR");
    await fillAddress(page);
    await fillPassword(page);
    await expect(page.getByTestId("summary-health")).not.toContainText("afiliado");
    await page.getByTestId("signup-submit").click();
    await expect(page).toHaveURL(/\/mis-turnos$/);
    expect(captured.complete?.healthPlanId).toBe(40);
    expect(captured.complete).not.toHaveProperty("affiliationNumber");
  });

  test("obra social sin número de afiliado: no deja avanzar", async ({ page }) => {
    await setup(page);
    await page.goto("/registrarse");
    await fillDni(page);
    await fillPersonal(page, true);
    await page.getByPlaceholder("Buscá tu obra social").fill("OSDE");
    await page.getByRole("button", { name: "OSDE", exact: true }).click();
    await next(page);
    await expect(page.getByText("Completá tu número de afiliado")).toBeVisible();
    await page.getByLabel("Número de afiliado").fill("12 34");
    await next(page);
    await expect(
      page.getByText(/Solo números, letras, guiones y barras, sin espacios/)
    ).toBeVisible();
    await expectStep(page, "Paso 3 de 5");
  });

  test("Atrás y Editar desde el resumen conservan lo cargado", async ({ page }) => {
    const captured = await setup(page);
    await page.goto("/registrarse");
    await fillDni(page);
    await fillPersonal(page, true);
    await chooseInsurance(page, "OSDE", "61234567801");

    // Atrás desde la dirección: la obra social y los datos siguen ahí.
    await expectStep(page, "Paso 4 de 5");
    await page.getByRole("button", { name: "Atrás" }).click();
    await expect(page.getByTestId("signup-health-selected")).toContainText("OSDE");
    await expect(page.getByLabel("Número de afiliado")).toHaveValue("61234567801");
    await page.getByRole("button", { name: "Atrás" }).click();
    await expect(page.getByLabel("Nombre")).toHaveValue("Lucía");
    await expect(page.getByLabel("Fecha de nacimiento")).toHaveValue("15/06/1991");
    await next(page);
    await next(page);
    await fillAddress(page);
    await fillPassword(page);

    // Editar la obra social desde el resumen y volver directo.
    await page.getByRole("button", { name: "Editar obra social" }).click();
    await expectStep(page, "Paso 3 de 5");
    await page.getByRole("button", { name: "Cambiar" }).click();
    await page.getByPlaceholder("Buscá tu obra social").fill("gal");
    await page.getByRole("button", { name: "Galeno" }).click();
    await page.getByRole("button", { name: "Azul" }).click();
    await page.getByLabel("Número de afiliado").fill("99887766");
    await page.getByRole("button", { name: "Volver al resumen" }).click();

    await expect(page.getByTestId("summary-health")).toContainText("Galeno");
    await expect(page.getByTestId("summary-health")).toContainText("Azul");
    await expect(page.getByTestId("summary-address")).toContainText(
      "Calle Ficticia 123, 2° B"
    );
    await expect(page.getByTestId("summary-personal")).toContainText("341 555 1234");
    await page.getByTestId("signup-submit").click();
    await expect(page).toHaveURL(/\/mis-turnos$/);
    expect(captured.complete?.healthPlanId).toBe(4);
    expect(captured.complete?.affiliationNumber).toBe("99887766");
  });
});

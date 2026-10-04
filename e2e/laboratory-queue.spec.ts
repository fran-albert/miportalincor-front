import { expect, Page, test } from "@playwright/test";
import { TURNOS_ORIGIN, fakeJwt, json, loginAs, mockApis } from "./helpers";

// Datos ficticios: nunca un paciente real.
const today = new Date().toISOString();

const entry = (overrides: Record<string, unknown>) => ({
  patientId: 9001,
  isGuest: false,
  doctorId: 0,
  doctorName: "Sin asignar",
  scheduledTime: "09:00",
  status: "WAITING",
  checkedInAt: today,
  waitingTimeMinutes: 4,
  ...overrides,
});

const LAB_ENTRY = entry({
  id: 501,
  appointmentType: "LABORATORY",
  patientName: "PRUEBA, LAURA",
  patientDocument: "40111222",
  doctorName: "Laboratorio",
  displayNumber: "L-001",
  queueNumber: 1,
  queuePrefix: "L",
});

const ADMIN_ENTRY = entry({
  id: 502,
  appointmentType: "ADMINISTRATIVE",
  patientName: "PRUEBA, TOMÁS",
  patientDocument: "40333444",
  displayNumber: "C-001",
  queueNumber: 1,
  queuePrefix: "C",
});

interface QueueState {
  callBodies: Array<{ id: string; body: unknown }>;
}

const setup = async (
  page: Page,
  roles: string[],
  waiting: unknown[]
): Promise<QueueState> => {
  const state: QueueState = { callBodies: [] };
  await loginAs(
    page,
    fakeJwt({ id: "3001", roles, firstName: "Jennifer", lastName: "Prueba" })
  );
  await mockApis(page, {
    [`GET ${TURNOS_ORIGIN}/queue/waiting`]: (route) => json(route, waiting),
    [`GET ${TURNOS_ORIGIN}/queue/today`]: (route) => json(route, waiting),
    [`POST ${TURNOS_ORIGIN}/queue/501/call`]: (route) => {
      state.callBodies.push({ id: "501", body: route.request().postDataJSON() });
      return json(route, { ...LAB_ENTRY, status: "CALLED", servicePoint: "LABORATORIO" });
    },
  });
  return state;
};

const openActions = async (page: Page, patientName: string) => {
  await page
    .getByRole("row", { name: new RegExp(patientName) })
    .getByRole("button", { name: "Ver acciones" })
    .click();
  return page.getByRole("dialog");
};

test.describe("Tótem: cola del laboratorio en el portal", () => {
  test("con el rol Laboratorio se ve solo la cola del laboratorio y se llama a Laboratorio", async ({
    page,
  }) => {
    // La API ya recorta la cola: al laboratorio solo le llega lo suyo.
    const state = await setup(page, ["Secretaria", "Laboratorio"], [LAB_ENTRY]);

    await page.goto("/turnos");

    await expect(page.getByRole("heading", { name: "Cola del Laboratorio" })).toBeVisible();
    // Ni calendario ni bloques de recepción.
    await expect(page.getByRole("tab", { name: "Calendario" })).toHaveCount(0);
    await expect(page.getByRole("region", { name: "Con turno" })).toHaveCount(0);
    await expect(page.getByRole("region", { name: "Administrativo" })).toHaveCount(0);
    await expect(page.getByRole("region", { name: "Laboratorio" })).toBeVisible();

    await expect(page.getByText("PRUEBA, LAURA")).toBeVisible();
    await expect(page.getByText("L-001")).toBeVisible();

    const dialog = await openActions(page, "PRUEBA, LAURA");
    await expect(dialog.getByRole("button", { name: "Recepción" })).toHaveCount(0);
    await expect(dialog.getByRole("button", { name: "Ventanilla" })).toHaveCount(0);
    await dialog.getByRole("button", { name: "Laboratorio" }).click();

    await expect.poll(() => state.callBodies).toEqual([
      { id: "501", body: { servicePoint: "LABORATORIO" } },
    ]);
  });

  test("recepción ve el bloque Laboratorio aparte y a ese paciente solo lo manda al laboratorio", async ({
    page,
  }) => {
    await setup(page, ["Secretaria"], [ADMIN_ENTRY, LAB_ENTRY]);

    await page.goto("/turnos");
    await page.getByRole("tab", { name: "Cola del Día" }).click();

    await expect(page.getByRole("heading", { name: "Cola del Día" })).toBeVisible();
    const labSection = page.getByRole("region", { name: "Laboratorio" });
    const receptionSection = page.getByRole("region", { name: "Administrativo" });
    await expect(labSection.getByText("PRUEBA, LAURA")).toBeVisible();
    await expect(labSection.getByText("PRUEBA, TOMÁS")).toHaveCount(0);
    // El paciente del laboratorio no se mezcla con los trámites de recepción.
    await expect(receptionSection.getByText("PRUEBA, TOMÁS")).toBeVisible();
    await expect(receptionSection.getByText("PRUEBA, LAURA")).toHaveCount(0);

    const labDialog = await openActions(page, "PRUEBA, LAURA");
    await expect(labDialog.getByRole("button", { name: "Laboratorio" })).toBeVisible();
    await expect(labDialog.getByRole("button", { name: "Ventanilla" })).toHaveCount(0);
    await page.keyboard.press("Escape");

    const adminDialog = await openActions(page, "PRUEBA, TOMÁS");
    await expect(adminDialog.getByRole("button", { name: "Recepción" })).toBeVisible();
    await expect(adminDialog.getByRole("button", { name: "Ventanilla" })).toBeVisible();
    await expect(adminDialog.getByRole("button", { name: "Laboratorio" })).toHaveCount(0);
  });

  test("recepción no ve el bloque Laboratorio si nadie espera en el laboratorio", async ({
    page,
  }) => {
    await setup(page, ["Secretaria"], [ADMIN_ENTRY]);

    await page.goto("/turnos");
    await page.getByRole("tab", { name: "Cola del Día" }).click();

    await expect(page.getByText("PRUEBA, TOMÁS")).toBeVisible();
    await expect(page.getByRole("region", { name: "Laboratorio" })).toHaveCount(0);
  });
});

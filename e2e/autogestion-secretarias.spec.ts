import { expect, Page, test } from "@playwright/test";
import { HC_ORIGIN, TURNOS_ORIGIN, fakeJwt, json, loginAs, mockApis } from "./helpers";

// Datos ficticios: nunca un médico ni un paciente real.
interface FakeDoctor {
  id: string;
  userId: number;
  firstName: string;
  lastName: string;
  userName: string;
  dni: string;
  email: string;
  matricula: string;
  specialities: Array<{ id: number; name: string }>;
  healthInsurances: [];
}

const doctor = (userId: number, firstName: string, lastName: string): FakeDoctor => ({
  id: `uuid-doc-${userId}`,
  userId,
  firstName,
  lastName,
  userName: `30${userId}000`,
  dni: `30${userId}000`,
  email: `${firstName.toLowerCase()}@prueba.test`,
  matricula: `${userId}`,
  specialities: [{ id: 1, name: "Cardiología" }],
  healthInsurances: [],
});

const LIBRE = doctor(501, "Martín", "Sinturnos");
const OCUPADO = doctor(502, "Lucía", "Conturnos");

interface State {
  active: FakeDoctor[];
  inactive: FakeDoctor[];
  deactivateCalls: string[];
  reactivateCalls: string[];
  consultationTypes: Array<Record<string, unknown>>;
  createdTypes: unknown[];
}

const paginated = (data: FakeDoctor[]) => ({
  data,
  total: data.length,
  page: 1,
  limit: 100,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
});

const consultationType = (id: number, name: string) => ({
  id,
  name,
  defaultDurationMinutes: 20,
  isActive: true,
  displayOrder: id,
  isEcoSubtype: false,
  isIntegralCheckupEco: false,
  createdAt: "2026-11-01T10:00:00.000Z",
  updatedAt: "2026-11-01T10:00:00.000Z",
});

const setup = async (page: Page): Promise<State> => {
  const state: State = {
    active: [LIBRE, OCUPADO],
    inactive: [],
    deactivateCalls: [],
    reactivateCalls: [],
    consultationTypes: [consultationType(1, "Consulta"), consultationType(2, "MAPA")],
    createdTypes: [],
  };
  await loginAs(
    page,
    fakeJwt({ id: "3001", roles: ["Secretaria"], firstName: "Jennifer", lastName: "Prueba" })
  );

  const move = (from: FakeDoctor[], to: FakeDoctor[], id: string) => {
    const index = from.findIndex((item) => item.id === id);
    if (index >= 0) {
      to.push(...from.splice(index, 1));
    }
  };

  await mockApis(page, {
    [`GET ${HC_ORIGIN}/doctor/search`]: (route) => json(route, paginated(state.active)),
    [`GET ${HC_ORIGIN}/doctor/inactive`]: (route) => json(route, paginated(state.inactive)),
    [`PATCH ${HC_ORIGIN}/doctor/${LIBRE.id}/deactivate`]: (route) => {
      state.deactivateCalls.push(LIBRE.id);
      move(state.active, state.inactive, LIBRE.id);
      return json(route, LIBRE);
    },
    [`PATCH ${HC_ORIGIN}/doctor/${OCUPADO.id}/deactivate`]: (route) => {
      state.deactivateCalls.push(OCUPADO.id);
      return json(
        route,
        {
          statusCode: 409,
          message: "Tiene turnos pendientes",
          pendingAppointments: 4,
          pendingOverturns: 1,
          nextDate: "2026-11-24",
        },
        409
      );
    },
    [`PATCH ${HC_ORIGIN}/doctor/${LIBRE.id}/reactivate`]: (route) => {
      state.reactivateCalls.push(LIBRE.id);
      move(state.inactive, state.active, LIBRE.id);
      return json(route, LIBRE);
    },
    [`GET ${TURNOS_ORIGIN}/appointments/doctor/${LIBRE.userId}/pending-future`]: (route) =>
      json(route, {
        doctorId: LIBRE.userId,
        appointments: 0,
        overturns: 0,
        total: 0,
        nextDate: null,
      }),
    [`GET ${TURNOS_ORIGIN}/appointments/doctor/${OCUPADO.userId}/pending-future`]: (route) =>
      json(route, {
        doctorId: OCUPADO.userId,
        appointments: 4,
        overturns: 1,
        total: 5,
        nextDate: "2026-11-24",
      }),
    [`GET ${TURNOS_ORIGIN}/consultation-types`]: (route) => json(route, state.consultationTypes),
    [`POST ${TURNOS_ORIGIN}/consultation-types`]: (route) => {
      const body = route.request().postDataJSON() as Record<string, unknown>;
      state.createdTypes.push(body);
      const created = { ...consultationType(3, String(body.name)), ...body, id: 3 };
      state.consultationTypes.push(created);
      return json(route, created, 201);
    },
  });
  return state;
};

const doctorRow = (page: Page, name: string) =>
  page.getByRole("row", { name: new RegExp(name) });

test.describe("Autogestión de secretarias", () => {
  test("desactiva un médico sin turnos, lo ve en Ver desactivados y lo reactiva", async ({
    page,
  }) => {
    const state = await setup(page);
    await page.goto("/medicos");

    await doctorRow(page, "Sinturnos, Martín").getByRole("button", { name: "Desactivar" }).click();
    const dialog = page.getByRole("dialog", { name: "Desactivar médico" });
    await expect(
      dialog.getByText(
        "No va a poder ingresar ni aparecer en agendas ni listados. Su historia clínica y lo que cargó se siguen viendo."
      )
    ).toBeVisible();
    await expect(dialog.getByRole("textbox")).toHaveCount(0);
    await dialog.getByRole("button", { name: "Desactivar" }).click();

    await expect(dialog).toBeHidden();
    await expect.poll(() => state.deactivateCalls).toEqual([LIBRE.id]);
    await expect(doctorRow(page, "Sinturnos, Martín")).toHaveCount(0);
    await expect(page.getByText("Conturnos, Lucía")).toBeVisible();

    await page.getByLabel("Ver desactivados").click();
    await expect(page.getByRole("heading", { name: "Médicos desactivados" })).toBeVisible();
    const inactiveRow = doctorRow(page, "Sinturnos, Martín");
    await expect(inactiveRow).toBeVisible();

    await inactiveRow.getByRole("button", { name: "Reactivar" }).click();
    const confirm = page.getByRole("alertdialog", { name: "Reactivar médico" });
    await confirm.getByRole("button", { name: "Reactivar" }).click();

    await expect.poll(() => state.reactivateCalls).toEqual([LIBRE.id]);
    await expect(page.getByText("No hay médicos desactivados.")).toBeVisible();

    await page.getByLabel("Ver desactivados").click();
    await expect(page.getByRole("heading", { name: "Lista de Médicos" })).toBeVisible();
    await expect(doctorRow(page, "Sinturnos, Martín")).toBeVisible();
  });

  test("con turnos pendientes no lo deja desactivar", async ({ page }) => {
    const state = await setup(page);
    await page.goto("/medicos");

    await doctorRow(page, "Conturnos, Lucía").getByRole("button", { name: "Desactivar" }).click();
    const dialog = page.getByRole("dialog", { name: "Desactivar médico" });

    await expect(
      dialog.getByText(
        "Tiene 5 turnos pendientes (próximo: 24/11). Reprogramalos o cancelalos antes de desactivarlo."
      )
    ).toBeVisible();
    await expect(dialog.getByText("Turnos: 4 · Sobreturnos: 1")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Desactivar" })).toBeDisabled();

    await dialog.getByRole("button", { name: "Cancelar" }).click();
    await expect(dialog).toBeHidden();
    expect(state.deactivateCalls).toEqual([]);
    await expect(doctorRow(page, "Conturnos, Lucía")).toBeVisible();
  });

  test("crea un tipo de estudio desde Configuración y solo ve esa sección", async ({ page }) => {
    const state = await setup(page);
    await page.goto("/configuracion");

    await expect(page.getByRole("heading", { name: "Tipos de estudio" })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Pantalla TV/ })).toHaveCount(0);
    await expect(page.getByRole("tab", { name: /Chequeos/ })).toHaveCount(0);
    await expect(page.getByText("MAPA", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: /Nuevo tipo/ }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Nombre *").fill("AMPA");
    await dialog.getByRole("button", { name: /Crear tipo/i }).click();

    await expect.poll(() => state.createdTypes).toEqual([
      expect.objectContaining({ name: "AMPA" }),
    ]);
    await expect(dialog).toBeHidden();
    await expect(page.getByText("AMPA", { exact: true })).toBeVisible();
  });

  test("la secretaria llega a Tipos de estudio desde el menú", async ({ page, isMobile }) => {
    test.skip(isMobile, "En el celular el menú lateral va dentro de un panel");
    await setup(page);
    await page.goto("/medicos");

    await page.getByRole("link", { name: "Tipos de estudio" }).click();
    await expect(page).toHaveURL(/\/configuracion$/);
    await expect(page.getByRole("heading", { name: "Tipos de estudio" })).toBeVisible();
  });
});

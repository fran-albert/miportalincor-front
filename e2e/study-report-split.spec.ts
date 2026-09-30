import { expect, Page, test } from "@playwright/test";
import { HC_ORIGIN, fakeJwt, json, loginAs, mockApis } from "./helpers";

// Datos ficticios: nunca un paciente real.
const ITEM_ID = "item-e2e-1";
const INSTANCE_IDS = Array.from({ length: 31 }, (_, index) => `instancia-${index + 1}`);

const TEMPLATES = [
  { key: "abdominal-ultrasound", label: "Ecografía de abdomen", subtypeAliases: [], fields: [] },
  {
    key: "abdominal-aorta-doppler",
    label: "Ecografía abdominal con Doppler de aorta",
    subtypeAliases: [],
    fields: [],
  },
  {
    key: "lower-limb-arterial-doppler",
    label: "Doppler arterial de miembros inferiores",
    subtypeAliases: [],
    fields: [],
  },
];

const thumbnail = (index: number) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">` +
  `<rect width="200" height="200" fill="#1f2937"/>` +
  `<text x="100" y="112" font-size="40" text-anchor="middle" fill="#9ca3af">${index}</text></svg>`;

interface SplitState {
  splitBodies: unknown[];
}

const setup = async (page: Page): Promise<SplitState> => {
  const state: SplitState = { splitBodies: [] };
  await loginAs(
    page,
    fakeJwt({ id: "1917", roles: ["Medico"], firstName: "Ecografista", lastName: "Prueba" })
  );
  const previews = Object.fromEntries(
    INSTANCE_IDS.map((instanceId, index) => [
      `GET ${HC_ORIGIN}/study-reports/inbox/${ITEM_ID}/images/${instanceId}`,
      (route: Parameters<typeof json>[0]) =>
        route.fulfill({ status: 200, contentType: "image/svg+xml", body: thumbnail(index + 1) }),
    ])
  );
  await mockApis(page, {
    ...previews,
    [`GET ${HC_ORIGIN}/study-reports/access`]: (route) => json(route, { enabled: true }),
    [`GET ${HC_ORIGIN}/study-reports/templates`]: (route) => json(route, TEMPLATES),
    [`GET ${HC_ORIGIN}/study-reports/mine`]: (route) =>
      json(route, [
        {
          sourceInboxItemId: ITEM_ID,
          report: null,
          state: "SIN_EMPEZAR",
          patientName: "PRUEBA LUCIA",
          patientDni: "40200200",
          studyDate: "2026-09-29T00:00:00.000Z",
          studyType: "Ecografía Abdominal, Ecografía Abdominal con Doppler de Aorta",
          splitLabel: null,
          claimed: false,
        },
      ]),
    [`GET ${HC_ORIGIN}/study-reports/inbox/${ITEM_ID}/images`]: (route) =>
      json(route, INSTANCE_IDS),
    [`POST ${HC_ORIGIN}/study-reports/split/${ITEM_ID}`]: (route) => {
      state.splitBodies.push(route.request().postDataJSON());
      return json(route, [], 201);
    },
  });
  return state;
};

const openSplit = async (page: Page) => {
  await page.goto("/mis-estudios-por-informar");
  await page.getByRole("button", { name: "Dividir" }).click();
  const dialog = page.getByRole("dialog", { name: "Dividir estudio en informes" });
  await expect(dialog.getByRole("img", { name: /para dividir$/ })).toHaveCount(
    INSTANCE_IDS.length
  );
  return dialog;
};

test.describe("Informes de ecografía: dividir un estudio", () => {
  test("en una notebook, con 3 informes se llega a 'Confirmar división' y se divide", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "El caso es el de una notebook: 1280×640");
    await page.setViewportSize({ width: 1280, height: 640 });
    const state = await setup(page);
    const dialog = await openSplit(page);

    await dialog.getByRole("button", { name: "Agregar informe" }).click();
    const confirm = dialog.getByRole("button", { name: "Confirmar división (3)" });

    // Con los informes todavía incompletos, el botón y el motivo por el que no
    // se habilita tienen que estar a la vista, sin scroll ni zoom.
    await expect(confirm).toBeInViewport({ ratio: 1 });
    await expect(confirm).toBeDisabled();
    await expect(
      dialog.getByText("Falta el nombre del informe A.")
    ).toBeInViewport({ ratio: 1 });

    await dialog.getByRole("button", { name: "Imagen 1 para dividir" }).click();
    const second = dialog.getByRole("button", { name: "Imagen 2 para dividir" });
    await second.click();
    await second.click();

    await dialog.getByLabel("Nombre del informe A").fill("Doppler arterial");
    await dialog.getByLabel("Plantilla A").selectOption("lower-limb-arterial-doppler");
    await dialog.getByLabel("Nombre del informe B").fill("Ecografía abdominal");
    await dialog.getByLabel("Plantilla B").selectOption("abdominal-ultrasound");
    await dialog.getByLabel("Nombre del informe C").fill("Doppler de aorta");
    await dialog.getByLabel("Plantilla C").selectOption("abdominal-aorta-doppler");

    await expect(confirm).toBeInViewport({ ratio: 1 });
    await expect(confirm).toBeEnabled();
    await confirm.click();

    await expect.poll(() => state.splitBodies.length).toBe(1);
    const body = state.splitBodies[0] as {
      groups: { label: string; templateKey: string; assignedInstanceIds: string[] }[];
    };
    expect(body.groups.map((group) => group.label)).toEqual([
      "Doppler arterial",
      "Ecografía abdominal",
      "Doppler de aorta",
    ]);
    expect(body.groups.map((group) => group.assignedInstanceIds.length)).toEqual([29, 1, 1]);
  });

  test("en una notebook, con el máximo de 6 informes el pie sigue a la vista", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "El caso es el de una notebook: 1280×640");
    await page.setViewportSize({ width: 1280, height: 640 });
    await setup(page);
    const dialog = await openSplit(page);

    const add = dialog.getByRole("button", { name: "Agregar informe" });
    for (let count = 2; count < 6; count++) await add.click();
    await expect(add).toHaveCount(0);

    await expect(dialog.getByRole("button", { name: "Confirmar división (6)" })).toBeInViewport({
      ratio: 1,
    });
    await expect(dialog.getByRole("button", { name: "Cancelar" })).toBeInViewport({ ratio: 1 });

    // El último informe se alcanza con el scroll de su columna.
    const lastName = dialog.getByLabel("Nombre del informe F");
    await lastName.scrollIntoViewIfNeeded();
    await expect(lastName).toBeInViewport({ ratio: 1 });
  });

  test("en el tamaño propio del dispositivo, con 3 informes el pie queda a la vista", async ({
    page,
  }) => {
    await setup(page);
    const dialog = await openSplit(page);

    await dialog.getByRole("button", { name: "Agregar informe" }).scrollIntoViewIfNeeded();
    await dialog.getByRole("button", { name: "Agregar informe" }).click();

    await expect(dialog.getByRole("button", { name: "Confirmar división (3)" })).toBeInViewport({
      ratio: 1,
    });
    const lastName = dialog.getByLabel("Nombre del informe C");
    await lastName.scrollIntoViewIfNeeded();
    await expect(lastName).toBeInViewport({ ratio: 1 });
  });
});

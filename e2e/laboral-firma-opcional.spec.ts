import { expect, Page, test } from "@playwright/test";
import { HC_ORIGIN, fakeJwt, json, loginAs, mockApis } from "./helpers";

// Datos ficticios: nunca un colaborador real.
const LABORAL = "http://laboral.e2e.test";
const COLLABORATOR_ID = 1;
const EVALUATION_ID = 8;
const EXAM_URL = `/incor-laboral/colaboradores/prueba-colaborador-${COLLABORATOR_ID}/examen/${EVALUATION_ID}`;

const base = {
  createdAt: "2026-10-01T10:00:00.000Z",
  updatedAt: "2026-10-01T10:00:00.000Z",
  deletedAt: "",
};

const collaborator = {
  ...base,
  id: COLLABORATOR_ID,
  firstName: "Prueba",
  lastName: "Colaborador",
  email: "prueba@e2e.test",
  slug: `prueba-colaborador-${COLLABORATOR_ID}`,
  birthDate: "1990-01-01",
  phone: "3410000000",
  userName: "90000099",
  gender: "Masculino",
  photoUrl: "",
  company: {
    ...base,
    id: 1,
    bussinesName: "Empresa de prueba",
    fantasyName: "Empresa de prueba",
    cuit: "20-00000000-0",
    email: "empresa@e2e.test",
    phoneNumber: "3410000000",
    addressId: 1,
  },
  positionJob: "Administración",
};

const medicalEvaluation = {
  ...base,
  id: EVALUATION_ID,
  collaborator,
  completed: false,
  doctorId: 80,
  evaluationType: { ...base, id: 3, name: "Preocupacional" },
  dataValues: [],
};

const maintenanceState = {
  medicalEvaluationId: EVALUATION_ID,
  doctorId: 80,
  completed: false,
  hasStudies: false,
  hasClinicalData: false,
  canDelete: true,
  deleteReasons: [],
};

interface UploadCapture {
  bodies: string[];
}

const setup = async (page: Page): Promise<UploadCapture> => {
  const capture: UploadCapture = { bodies: [] };
  await loginAs(
    page,
    fakeJwt({
      id: "2",
      roles: ["Secretaria", "Laboral"],
      firstName: "Secretaria",
      lastName: "Prueba",
    })
  );
  await mockApis(page, {
    [`GET ${LABORAL}/collaborator/${COLLABORATOR_ID}`]: (route) =>
      json(route, collaborator),
    [`GET ${LABORAL}/medical-evaluation/${EVALUATION_ID}`]: (route) =>
      json(route, medicalEvaluation),
    [`GET ${LABORAL}/medical-evaluation/${EVALUATION_ID}/maintenance-state`]: (
      route
    ) => json(route, maintenanceState),
    [`GET ${LABORAL}/medical-evaluation-report-versions/exam/${EVALUATION_ID}`]: (
      route
    ) => json(route, { currentVersion: null, finalVersion: null, versions: [] }),
    [`GET ${HC_ORIGIN}/doctor/search`]: (route) =>
      json(route, { data: [], total: 0, page: 1, limit: 100, totalPages: 0 }),
    [`GET ${HC_ORIGIN}/study/signature`]: (route) => json(route, {}),
    [`POST ${LABORAL}/file/upload-study`]: (route) => {
      capture.bodies.push(route.request().postData() ?? "");
      return json(
        route,
        { url: "https://s3.e2e.test/studies/90000099/electro.pdf?x=1" },
        201
      );
    },
  });
  return capture;
};

const multipartField = (body: string, name: string): string | null => {
  const match = body.match(
    new RegExp(`name="${name}"\\r?\\n\\r?\\n([^\\r\\n]*)`)
  );
  return match ? match[1] : null;
};

const openStudiesTab = async (page: Page) => {
  await page.goto(EXAM_URL);
  await page.getByRole("tab", { name: "Estudios" }).click();
  await expect(
    page.getByRole("heading", { name: "Estudios y archivos" })
  ).toBeVisible();
};

const sectionOf = (page: Page, title: string) =>
  page.locator("section", {
    has: page.getByRole("heading", { name: title, exact: true }),
  });

const pdf = (name: string) => ({
  name,
  mimeType: "application/pdf",
  buffer: Buffer.from("%PDF-1.4 e2e"),
});

test.describe("Laboral: firma opcional al subir el electro", () => {
  test("el checkbox aparece marcado en Electro y Ergometría, y no en Laboratorios", async ({
    page,
  }) => {
    await setup(page);
    await openStudiesTab(page);

    const electro = sectionOf(page, "Electrocardiograma").getByRole("checkbox", {
      name: /inyectar firma/i,
    });
    const ergo = sectionOf(page, "Ergometría").getByRole("checkbox", {
      name: /inyectar firma/i,
    });
    await expect(electro).toBeChecked();
    await expect(ergo).toBeChecked();
    await expect(
      sectionOf(page, "Laboratorios").getByRole("checkbox", {
        name: /inyectar firma/i,
      })
    ).toHaveCount(0);
  });

  test("por defecto el electro se sube sin skipSignature", async ({ page }) => {
    const capture = await setup(page);
    await openStudiesTab(page);

    await page
      .locator("#file-input-electrocardiograma")
      .setInputFiles(pdf("electro.pdf"));

    await expect.poll(() => capture.bodies.length).toBe(1);
    expect(multipartField(capture.bodies[0], "studyType")).toBe(
      "Electrocardiograma"
    );
    expect(multipartField(capture.bodies[0], "skipSignature")).toBeNull();
    await expect(page.getByText("Electrocardiograma subido con éxito")).toBeVisible();
  });

  test("desmarcado, manda skipSignature=true y vuelve a quedar marcado", async ({
    page,
  }) => {
    const capture = await setup(page);
    await openStudiesTab(page);

    const checkbox = sectionOf(page, "Electrocardiograma").getByRole("checkbox", {
      name: /inyectar firma/i,
    });
    await checkbox.click();
    await expect(checkbox).not.toBeChecked();

    await page
      .locator("#file-input-electrocardiograma")
      .setInputFiles(pdf("electro-firmado-en-papel.pdf"));

    await expect.poll(() => capture.bodies.length).toBe(1);
    expect(multipartField(capture.bodies[0], "skipSignature")).toBe("true");
    expect(multipartField(capture.bodies[0], "userName")).toBe("90000099");
    await expect(page.getByText("Electrocardiograma subido con éxito")).toBeVisible();
    await expect(checkbox).toBeChecked();
  });
});

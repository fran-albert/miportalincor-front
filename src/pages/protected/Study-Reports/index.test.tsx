// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import StudyReportsPage from "./index";

const getMyStudyReports = vi.fn();
const getStudyReportTemplates = vi.fn();
const saveStudyReportDraft = vi.fn();
const getStudyReportImages = vi.fn();
const getStudyReportImagePreview = vi.fn();
const splitStudyReport = vi.fn();
const previewStudyReport = vi.fn();
const signStudyReport = vi.fn();
const getOrphanStudies = vi.fn();
const claimOrphanStudy = vi.fn();
const releaseOrphanStudy = vi.fn();
const getOrphanStudyImages = vi.fn();
const getOrphanStudyImagePreview = vi.fn();

vi.mock("@/api/StudyReport/study-report.actions", () => ({
  getMyStudyReports: () => getMyStudyReports() as unknown,
  getStudyReportTemplates: () => getStudyReportTemplates() as unknown,
  saveStudyReportDraft: (id: string, key: string, content: unknown) =>
    saveStudyReportDraft(id, key, content) as unknown,
  getStudyReportImages: (id: string) => getStudyReportImages(id) as unknown,
  getStudyReportImagePreview: (id: string, instanceId: string) =>
    getStudyReportImagePreview(id, instanceId) as unknown,
  previewStudyReport: (id: string) => previewStudyReport(id) as unknown,
  signStudyReport: (id: string) => signStudyReport(id) as unknown,
  addStudyReportAddendum: vi.fn(),
  getStudyReportInboxImages: (id: string) => getStudyReportImages(id) as unknown,
  getStudyReportInboxImagePreview: (id: string, instanceId: string) => getStudyReportImagePreview(id, instanceId) as unknown,
  splitStudyReport: (id: string, groups: unknown) => splitStudyReport(id, groups) as unknown,
  getOrphanStudies: (days?: number) => getOrphanStudies(days) as unknown,
  claimOrphanStudy: (id: string, patientUserId?: string) => claimOrphanStudy(id, patientUserId) as unknown,
  releaseOrphanStudy: (id: string) => releaseOrphanStudy(id) as unknown,
  getOrphanStudyImages: (id: string) => getOrphanStudyImages(id) as unknown,
  getOrphanStudyImagePreview: (id: string, instanceId: string) => getOrphanStudyImagePreview(id, instanceId) as unknown,
}));
vi.mock("@/api/StudyReport/study-report-images.actions", () => ({
  getStudyReportImages: (id: string) => getStudyReportImages(id) as unknown,
  getStudyReportImagePreview: (id: string, instanceId: string) =>
    getStudyReportImagePreview(id, instanceId) as unknown,
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock("react-helmet-async", () => ({ Helmet: () => null }));
vi.mock("@/components/PageHeader", () => ({
  PageHeader: ({
    breadcrumbItems,
    title,
    actions,
  }: {
    breadcrumbItems: Array<{ label: string }>;
    title: string;
    actions?: ReactNode;
  }) => (
    <div data-testid="study-report-page-header">
      <span>{breadcrumbItems.map((item) => item.label).join(" / ")}</span>
      <h1>{title}</h1>
      {actions}
    </div>
  ),
}));
// El diálogo de reclamo trae el buscador del padrón, que arrastra la config
// del entorno entera: el doble tiene que cubrirla o el import se cae.
vi.mock("@/config/environment", () => ({
  environment: { API_INCOR_HC_URL: "https://api.test", NODE_ENV: "development" },
  currentConfig: { enableLogging: false, enableDevTools: false },
  isDevelopment: () => true,
  isStaging: () => false,
  isProduction: () => false,
}));

const renderPage = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <StudyReportsPage />
    </QueryClientProvider>,
  );
};

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

beforeEach(() => {
  getOrphanStudies.mockResolvedValue([]);
});

beforeAll(() => {
  URL.createObjectURL = vi.fn(() => "blob:study-report-image");
  URL.revokeObjectURL = vi.fn();
});

describe("StudyReportsPage — prellenado del informe-normal al abrir", () => {
  it("hidrata la plantilla y los defaults que devuelve el backend al crear el borrador", async () => {
    getMyStudyReports.mockResolvedValue([
      {
        sourceInboxItemId: "item-1",
        report: null,
        state: "SIN_EMPEZAR",
        patientName: "PACIENTE PRUEBA",
        patientDni: "30111222",
        studyDate: "2026-07-20",
        studyType: "Ecografia Renal",
        splitLabel: null,
      },
    ]);
    // La 1ra plantilla (templates[0]) es la genérica: si el front no hidrata,
    // mostraría ésta y sin defaults.
    getStudyReportTemplates.mockResolvedValue([
      { key: "generic", label: "Informe ecográfico", subtypeAliases: [], fields: [] },
      {
        key: "renal",
        label: "Ecografía renal bilateral",
        subtypeAliases: ["Ecografia Renal"],
        fields: [
          { key: "rinon_der", label: "Riñón derecho", type: "text", required: false },
        ],
      },
    ]);
    // El backend elige "renal" por subtipo y prellena el default normal.
    saveStudyReportDraft.mockResolvedValue({
      id: "report-1",
      templateKey: "renal",
      content: { rinon_der: "En posición normal y de forma conservada." },
      status: "BORRADOR",
    });
    getStudyReportImages.mockResolvedValue(["instance-1"]);
    getStudyReportImagePreview.mockResolvedValue(
      new Blob(["jpg"], { type: "image/jpeg" }),
    );

    renderPage();
    await userEvent.click(await screen.findByRole("button", { name: /Informar/i }));

    // Con el fix, el textarea del riñón derecho muestra el default del backend.
    expect(
      await screen.findByDisplayValue("En posición normal y de forma conservada."),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(saveStudyReportDraft).toHaveBeenCalledWith("item-1", expect.any(String), expect.any(Object)),
    );

    // La galería usa el endpoint autenticado de previews del informe.
    await waitFor(() =>
      expect(screen.getByRole("img", { name: "Imagen 1 del estudio" })).toHaveAttribute(
        "src",
        "blob:study-report-image",
      ),
    );
  });

  it("muestra la etiqueta de los informes hermanos y el botón dividir sólo en sin empezar", async () => {
    getMyStudyReports.mockResolvedValue([
      {
        sourceInboxItemId: "item-1",
        report: null,
        state: "SIN_EMPEZAR",
        patientName: "PACIENTE PRUEBA",
        patientDni: "30111222",
        studyDate: "2026-07-20",
        studyType: "Ecografía combinada",
        splitLabel: null,
      },
      {
        sourceInboxItemId: "item-2",
        report: { id: "report-a", templateKey: "gineco", content: {}, status: "BORRADOR" },
        state: "BORRADOR",
        patientName: "PACIENTE PRUEBA",
        patientDni: "30111222",
        studyDate: "2026-07-20",
        studyType: "Ecografía combinada",
        splitLabel: "Gineco",
      },
      {
        sourceInboxItemId: "item-2",
        report: { id: "report-b", templateKey: "mamaria", content: {}, status: "BORRADOR" },
        state: "BORRADOR",
        patientName: "PACIENTE PRUEBA",
        patientDni: "30111222",
        studyDate: "2026-07-20",
        studyType: "Ecografía combinada",
        splitLabel: "Mama",
      },
    ]);
    getStudyReportTemplates.mockResolvedValue([
      { key: "gineco", label: "Ginecológica", subtypeAliases: [], fields: [] },
    ]);
    getStudyReportImages.mockResolvedValue([]);
    splitStudyReport.mockResolvedValue([]);

    renderPage();

    // el nombre de cada informe hermano se muestra en la columna Tipo
    expect(await screen.findByText("Gineco")).toBeInTheDocument();
    expect(screen.getByText("Mama")).toBeInTheDocument();
    // el paciente ya no repite el label
    expect(screen.getAllByText("PACIENTE PRUEBA")).toHaveLength(3);
    expect(screen.getByRole("button", { name: "Dividir" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Continuar" })).toHaveLength(2);
    // cada borrador puede descartarse
    expect(
      screen.getAllByRole("button", { name: "Descartar borrador" }),
    ).toHaveLength(2);
  });
});

describe("StudyReportsPage — flujo de firma seguro", () => {
  it("firma sin exigir preview, pero siempre con el modal de confirmación", async () => {
    getMyStudyReports.mockResolvedValue([
      {
        sourceInboxItemId: "item-1",
        report: null,
        state: "SIN_EMPEZAR",
        patientName: "PACIENTE PRUEBA",
        patientDni: "30111222",
        studyDate: "2026-07-28",
        studyType: "Ecografia Renal",
        splitLabel: null,
      },
    ]);
    getStudyReportTemplates.mockResolvedValue([
      {
        key: "renal",
        label: "Ecografía renal bilateral",
        subtypeAliases: ["Ecografia Renal"],
        fields: [
          { key: "rinon_der", label: "Riñón derecho", type: "text", required: false },
        ],
      },
    ]);
    saveStudyReportDraft.mockResolvedValue({
      id: "report-1",
      templateKey: "renal",
      content: { rinon_der: "En posición normal." },
      status: "BORRADOR",
    });
    getStudyReportImages.mockResolvedValue([]);
    previewStudyReport.mockResolvedValue(
      new Blob(["pdf"], { type: "application/pdf" }),
    );
    signStudyReport.mockResolvedValue({
      id: "report-1",
      templateKey: "renal",
      content: {},
      status: "FIRMADO",
    });

    renderPage();
    await userEvent.click(await screen.findByRole("button", { name: /Informar/i }));

    // Decisión 2026-07-31 (pedido de Andrea): el preview es opcional, no traba
    // la firma. Atiende cada 10 minutos y previsualizar siempre la atrasaba.
    const firmarBtn = await screen.findByRole("button", { name: /Firmar informe/i });
    await waitFor(() => expect(firmarBtn).toBeEnabled());

    // Editar tampoco bloquea la firma.
    const textarea = await screen.findByDisplayValue("En posición normal.");
    await userEvent.type(textarea, " X");
    expect(firmarBtn).toBeEnabled();

    // El modal de confirmación SÍ sigue siendo obligatorio: firmar es
    // irreversible, se publica en la historia clínica.
    await userEvent.click(firmarBtn);
    expect(await screen.findByText("¿Firmar el informe?")).toBeInTheDocument();
    expect(signStudyReport).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: /^Firmar$/ }));
    await waitFor(() => expect(signStudyReport).toHaveBeenCalledWith("report-1"));
  });

  it("previsualizar sigue disponible para quien quiera revisar antes", async () => {
    getMyStudyReports.mockResolvedValue([
      {
        sourceInboxItemId: "item-1",
        report: null,
        state: "SIN_EMPEZAR",
        patientName: "PACIENTE PRUEBA",
        patientDni: "30111222",
        studyDate: "2026-07-28",
        studyType: "Ecografia Renal",
        splitLabel: null,
      },
    ]);
    getStudyReportTemplates.mockResolvedValue([
      {
        key: "renal",
        label: "Ecografía renal bilateral",
        subtypeAliases: ["Ecografia Renal"],
        fields: [
          { key: "rinon_der", label: "Riñón derecho", type: "text", required: false },
        ],
      },
    ]);
    saveStudyReportDraft.mockResolvedValue({
      id: "report-1",
      templateKey: "renal",
      content: { rinon_der: "En posición normal." },
      status: "BORRADOR",
    });
    getStudyReportImages.mockResolvedValue([]);
    previewStudyReport.mockResolvedValue(
      new Blob(["pdf"], { type: "application/pdf" }),
    );

    renderPage();
    await userEvent.click(await screen.findByRole("button", { name: /Informar/i }));

    await userEvent.click(
      await screen.findByRole("button", { name: /Previsualizar PDF/i }),
    );
    await waitFor(() => expect(previewStudyReport).toHaveBeenCalledWith("report-1"));
  });
});

describe("StudyReportsPage — cambio de plantilla", () => {
  it("carga los textos normales de la plantilla nueva en vez de vaciar los campos", async () => {
    // Bug reportado por Andrea (2026-07-31): al elegir otra plantilla a mano
    // (caso multi-tipo) los campos quedaban vacíos y perdía el informe-normal.
    getMyStudyReports.mockResolvedValue([
      {
        sourceInboxItemId: "item-1",
        report: null,
        state: "SIN_EMPEZAR",
        patientName: "PACIENTE PRUEBA",
        patientDni: "30111222",
        studyDate: "2026-07-31",
        studyType: "Ecografia Renal",
        splitLabel: null,
      },
    ]);
    getStudyReportTemplates.mockResolvedValue([
      {
        key: "renal",
        label: "Ecografía renal bilateral",
        subtypeAliases: ["Ecografia Renal"],
        fields: [
          {
            key: "rinon_der",
            label: "Riñón derecho",
            type: "text",
            required: false,
            default: "En posición normal y de forma conservada.",
          },
        ],
      },
      {
        key: "mama",
        label: "Ecografía mamaria bilateral",
        subtypeAliases: [],
        fields: [
          {
            key: "mama_der",
            label: "Mama derecha",
            type: "text",
            required: false,
            default: "No se observan lesiones quísticas.",
          },
          { key: "obs", label: "Observaciones", type: "text", required: false },
        ],
      },
    ]);
    saveStudyReportDraft.mockResolvedValue({
      id: "report-1",
      templateKey: "renal",
      content: { rinon_der: "En posición normal y de forma conservada." },
      status: "BORRADOR",
    });
    getStudyReportImages.mockResolvedValue([]);

    renderPage();
    await userEvent.click(await screen.findByRole("button", { name: /Informar/i }));
    await screen.findByDisplayValue("En posición normal y de forma conservada.");

    await userEvent.selectOptions(
      screen.getByRole("combobox"),
      "mama",
    );

    // El campo con default trae su texto normal; el que no tiene, queda vacío.
    expect(
      await screen.findByDisplayValue("No se observan lesiones quísticas."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Observaciones")).toHaveValue("");
  });
});

describe("StudyReportsPage — fecha del estudio", () => {
  it("muestra la fecha UTC del estudio sin correrse un día en zona argentina", async () => {
    // Bug 2026-07-28: un estudio del 28/07 (medianoche UTC) se mostraba
    // como 27/7/2026 en UTC-3.
    getMyStudyReports.mockResolvedValue([
      {
        sourceInboxItemId: "item-fecha",
        report: null,
        state: "SIN_EMPEZAR",
        patientName: "PACIENTE PRUEBA",
        patientDni: "30111222",
        studyDate: "2026-07-28T00:00:00.000Z",
        studyType: "Ecografia Abdominal",
        splitLabel: null,
      },
    ]);
    getStudyReportTemplates.mockResolvedValue([]);

    renderPage();

    expect(await screen.findByText("28/7/2026")).toBeInTheDocument();
    expect(screen.queryByText("27/7/2026")).not.toBeInTheDocument();
  });
});

describe("StudyReportsPage — jerarquía del portal", () => {
  it("muestra PageHeader, breadcrumb, actualizar y DataTable compartido", async () => {
    getMyStudyReports.mockResolvedValue([]);

    renderPage();

    expect(await screen.findByTestId("study-report-page-header")).toHaveTextContent(
      "Inicio / Mis estudios por informar",
    );
    expect(screen.getByRole("heading", { name: "Mis estudios por informar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Actualizar" })).toBeInTheDocument();
    expect(await screen.findByRole("table")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Actualizar" }));
    await waitFor(() => expect(getMyStudyReports).toHaveBeenCalledTimes(2));
  });
});

describe("StudyReportsPage — refresco automático", () => {
  it("refresca la lista cada 15 segundos y se detiene al abrir el editor", async () => {
    vi.useFakeTimers();
    getMyStudyReports.mockResolvedValue([
      {
        sourceInboxItemId: "item-1",
        report: {
          id: "report-1",
          templateKey: "renal",
          content: {},
          status: "BORRADOR",
        },
        state: "BORRADOR",
        patientName: "PACIENTE PRUEBA",
        patientDni: "30111222",
        studyDate: "2026-07-20",
        studyType: "Ecografía renal",
        splitLabel: null,
      },
    ]);
    getStudyReportTemplates.mockResolvedValue([
      {
        key: "renal",
        label: "Ecografía renal",
        subtypeAliases: ["Ecografía renal"],
        fields: [],
      },
    ]);
    getStudyReportImages.mockResolvedValue([]);

    const view = renderPage();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(getMyStudyReports).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(14_999);
    });
    expect(getMyStudyReports).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(getMyStudyReports).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });
    expect(getMyStudyReports).toHaveBeenCalledTimes(2);

    view.unmount();
  });
});

// ============================================================
// Estudios sin asignar: la red para cuando la atención se hizo sin turno.
//
// El 24/08 Andrea Torri hizo una eco un día sin agenda abierta con una paciente
// esperando el informe: el estudio salió del ecógrafo sin AccessionNumber y no
// apareció en su cola. Tercera vez en el mes, 88 acumulados. Antes de esto la
// única salida era pedir que lo rescataran con SQL contra producción.
// ============================================================
describe("StudyReportsPage — estudios sin asignar", () => {
  const huerfano = {
    sourceInboxItemId: "item-huerfano",
    detectedPatientName: "MP",
    detectedDni: null,
    studyDate: "2026-08-24T00:00:00.000Z",
    receivedAt: "2026-08-24T11:05:00.000Z",
    studySubtype: null,
    imageCount: 4,
    hasImages: false,
    needsPatient: false,
  };

  it("no mezcla los estudios sin asignar con la cola de por informar", async () => {
    getMyStudyReports.mockResolvedValue([]);
    getStudyReportTemplates.mockResolvedValue([]);
    getOrphanStudies.mockResolvedValue([huerfano]);

    renderPage();

    // La pestaña por defecto es la cola de siempre: el circuito normal no
    // cambió y lo primero que ve sigue siendo lo que tiene para informar.
    expect(await screen.findByRole("table")).toBeInTheDocument();
    expect(screen.queryByText("MP")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("tab", { name: /Sin asignar/i }));

    expect(await screen.findByText("MP")).toBeInTheDocument();
  });

  it("cuenta los estudios sin asignar en la pestaña para que se note que hay algo", async () => {
    getMyStudyReports.mockResolvedValue([]);
    getStudyReportTemplates.mockResolvedValue([]);
    getOrphanStudies.mockResolvedValue([huerfano, { ...huerfano, sourceInboxItemId: "item-2" }]);

    renderPage();

    // El contador va en un Badge dentro del trigger, como en la bandeja de
    // secretaría: el nombre accesible queda "Sin asignar 2".
    expect(
      await screen.findByRole("tab", { name: /Sin asignar\s*2/i }),
    ).toBeInTheDocument();
  });

  it("reclama el estudio y refresca las dos listas", async () => {
    getMyStudyReports.mockResolvedValue([]);
    getStudyReportTemplates.mockResolvedValue([]);
    getOrphanStudies.mockResolvedValue([huerfano]);
    claimOrphanStudy.mockResolvedValue({
      sourceInboxItemId: "item-huerfano",
      claimedByDoctorId: "176",
      claimedAt: "2026-08-24T12:00:00.000Z",
      claimedPatientUserId: "5001",
    });

    renderPage();
    await userEvent.click(screen.getByRole("tab", { name: /Sin asignar/i }));
    await userEvent.click(await screen.findByRole("button", { name: /Es mío/i }));
    await userEvent.click(await screen.findByRole("button", { name: /Sí, es mío/i }));

    await waitFor(() =>
      expect(claimOrphanStudy).toHaveBeenCalledWith("item-huerfano", undefined),
    );
    // La cola tiene que volver a pedirse: el estudio ahora está ahí.
    await waitFor(() => expect(getMyStudyReports).toHaveBeenCalledTimes(2));
  });

  it("un estudio reclamado se puede soltar desde la cola, con confirmación", async () => {
    getMyStudyReports.mockResolvedValue([
      {
        sourceInboxItemId: "item-huerfano",
        report: null,
        state: "SIN_EMPEZAR",
        patientName: "PERALTA MARTA",
        patientDni: "40100204",
        studyDate: "2026-08-24T00:00:00.000Z",
        studyType: null,
        splitLabel: null,
        claimed: true,
      },
    ]);
    getStudyReportTemplates.mockResolvedValue([]);
    getOrphanStudies.mockResolvedValue([]);
    releaseOrphanStudy.mockResolvedValue({
      sourceInboxItemId: "item-huerfano",
      claimedByDoctorId: null,
      claimedAt: null,
      claimedPatientUserId: null,
    });
    const confirmar = vi.spyOn(window, "confirm").mockReturnValue(true);

    renderPage();
    await userEvent.click(await screen.findByRole("button", { name: /No es mío/i }));

    expect(confirmar).toHaveBeenCalled();
    await waitFor(() =>
      expect(releaseOrphanStudy).toHaveBeenCalledWith("item-huerfano"),
    );
    confirmar.mockRestore();
  });

  it("un estudio que llegó por su turno no ofrece soltarlo", async () => {
    getMyStudyReports.mockResolvedValue([
      {
        sourceInboxItemId: "item-1",
        report: null,
        state: "SIN_EMPEZAR",
        patientName: "PACIENTE PRUEBA",
        patientDni: "30111222",
        studyDate: "2026-07-20T00:00:00.000Z",
        studyType: "Ecografia Renal",
        splitLabel: null,
        claimed: false,
      },
    ]);
    getStudyReportTemplates.mockResolvedValue([]);
    getOrphanStudies.mockResolvedValue([]);

    renderPage();

    expect(await screen.findByRole("button", { name: /Informar/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /No es mío/i })).not.toBeInTheDocument();
  });
});

// ============================================================
// La miniatura tiene que sobrevivir al cambio de pestaña.
//
// Radix desmonta el contenido de la pestaña inactiva. Con la miniatura en
// estado local + useEffect, volver a "Sin asignar" remonta cada tarjeta desde
// cero y vuelve a pedir las dos llamadas (listado de instancias + preview).
// Con 80 estudios eso es 160 pedidos cada vez que se toca la pestaña: el
// navegador encola, varios fallan y quedan con el icono de "sin vista previa".
// Ese es el "desaparece la carga de imagenes" que reporto Francisco el 25/08.
// ============================================================
describe("StudyReportsPage — la miniatura sin asignar sobrevive al cambio de pestaña", () => {
  const conImagenes = {
    sourceInboxItemId: "item-huerfano",
    detectedPatientName: "MP",
    detectedDni: null,
    studyDate: "2026-08-24T00:00:00.000Z",
    receivedAt: "2026-08-24T11:05:00.000Z",
    studySubtype: null,
    imageCount: 4,
    hasImages: true,
    needsPatient: false,
  };

  it("no vuelve a pedir la miniatura al volver a la pestaña, y la sigue mostrando", async () => {
    getMyStudyReports.mockResolvedValue([]);
    getStudyReportTemplates.mockResolvedValue([]);
    getOrphanStudies.mockResolvedValue([conImagenes]);
    getOrphanStudyImages.mockResolvedValue(["inst-1", "inst-2"]);
    getOrphanStudyImagePreview.mockResolvedValue(new Blob(["jpeg"]));

    renderPage();

    await userEvent.click(screen.getByRole("tab", { name: /Sin asignar/i }));
    expect(await screen.findByRole("img", { name: /Primera imagen/i })).toBeInTheDocument();
    expect(getOrphanStudyImages).toHaveBeenCalledTimes(1);
    expect(getOrphanStudyImagePreview).toHaveBeenCalledTimes(1);

    // Ida a "Por informar" y vuelta: exactamente lo que hace la ecografista
    // cuando revisa su cola y vuelve a la lista de sin asignar.
    await userEvent.click(screen.getByRole("tab", { name: /Por informar/i }));
    await userEvent.click(screen.getByRole("tab", { name: /Sin asignar/i }));

    expect(await screen.findByRole("img", { name: /Primera imagen/i })).toBeInTheDocument();
    expect(getOrphanStudyImages).toHaveBeenCalledTimes(1);
    expect(getOrphanStudyImagePreview).toHaveBeenCalledTimes(1);
  });
});

// ============================================================
// Las pestañas tienen que verse como las de "Estudios recibidos".
//
// Francisco, 25/08, después de usar la pantalla en producción: "las tabs, que
// sean por ejemplo las de estudios recibidos, con ese diseño". El TabsList ya
// estaba igual, pero los triggers habían quedado planos y el contador de "Sin
// dueño" se copió sin la inversión de colores: sobre la pestaña activa, en
// verde, quedaba gris claro sobre verde.
// ============================================================
describe("StudyReportsPage — las pestañas usan el diseño del portal", () => {
  const huerfanoSinImagenes = {
    sourceInboxItemId: "item-huerfano",
    detectedPatientName: "MP",
    detectedDni: null,
    studyDate: "2026-08-24T00:00:00.000Z",
    receivedAt: "2026-08-24T11:05:00.000Z",
    studySubtype: null,
    imageCount: 4,
    hasImages: false,
    needsPatient: false,
  };

  const renderConHuerfanos = () => {
    getMyStudyReports.mockResolvedValue([]);
    getStudyReportTemplates.mockResolvedValue([]);
    getOrphanStudies.mockResolvedValue([huerfanoSinImagenes]);
    renderPage();
  };

  it("las dos pestañas son la pastilla verde de Estudios recibidos", async () => {
    renderConHuerfanos();

    const porInformar = await screen.findByRole("tab", { name: /Por informar/i });
    const sinAsignar = screen.getByRole("tab", { name: /Sin asignar/i });

    for (const pestana of [porInformar, sinAsignar]) {
      expect(pestana.className).toContain("rounded-lg");
      expect(pestana.className).toContain("border-gray-200");
      expect(pestana.className).toContain("bg-white");
      expect(pestana.className).toContain("shadow-sm");
      expect(pestana.className).toContain("hover:border-greenPrimary/40");
      expect(pestana.className).toContain("data-[state=active]:bg-greenPrimary");
      expect(pestana.className).toContain("data-[state=active]:text-white");
    }
  });

  it("el contador de sin asignar se sigue leyendo con la pestaña activa", async () => {
    renderConHuerfanos();

    const contador = await screen.findByText("1");
    expect(contador.className).toContain("group-data-[state=active]:bg-white");
    expect(contador.className).toContain(
      "group-data-[state=active]:text-greenPrimary",
    );

    await userEvent.click(screen.getByRole("tab", { name: /Sin asignar/i }));

    const activa = screen.getByRole("tab", { name: /Sin asignar/i });
    expect(activa).toHaveAttribute("data-state", "active");
    expect(activa.className).toContain("group");
  });
});

// ============================================================
// La otra mitad del caché: lo que SÍ tiene que volver a pedirse.
//
// Cachear para siempre una miniatura que falló dejaría la tarjeta con el
// icono de "sin vista previa" hasta recargar la página, que es justo el
// síntoma que se vino a arreglar.
// ============================================================
describe("StudyReportsPage — la miniatura que falló se reintenta", () => {
  const conImagenes = {
    sourceInboxItemId: "item-huerfano",
    detectedPatientName: "MP",
    detectedDni: null,
    studyDate: "2026-08-24T00:00:00.000Z",
    receivedAt: "2026-08-24T11:05:00.000Z",
    studySubtype: null,
    imageCount: 4,
    hasImages: true,
    needsPatient: false,
  };

  it("vuelve a intentar al volver a la pestaña si el PACS se cayó", async () => {
    getMyStudyReports.mockResolvedValue([]);
    getStudyReportTemplates.mockResolvedValue([]);
    getOrphanStudies.mockResolvedValue([conImagenes]);
    getOrphanStudyImages.mockRejectedValueOnce(new Error("PACS caído"));
    getOrphanStudyImagePreview.mockResolvedValue(new Blob(["jpeg"]));

    renderPage();

    await userEvent.click(screen.getByRole("tab", { name: /Sin asignar/i }));
    expect(await screen.findByText("Sin vista previa")).toBeInTheDocument();

    getOrphanStudyImages.mockResolvedValue(["inst-1"]);
    await userEvent.click(screen.getByRole("tab", { name: /Por informar/i }));
    await userEvent.click(screen.getByRole("tab", { name: /Sin asignar/i }));

    expect(
      await screen.findByRole("img", { name: /Primera imagen/i }),
    ).toBeInTheDocument();
  });
});

// ============================================================
// "Sin dueño" no va.
//
// Francisco, 25/08, mirando la pantalla en producción: «"Sin dueño" ese
// nombre no va». Habla de estudios de pacientes reales, y "sin dueño" suena a
// objeto perdido. El nombre es "Sin asignar": describe el estado real —el
// estudio existe, todavía no se le asignó profesional— sin cargar a nadie.
//
// Se renombra SÓLO el texto que se ve. `orphans`/`OrphanStudiesList`/las rutas
// siguen igual: renombrarlos no le cambia nada a la ecografista y arrastra
// riesgo por toda la app.
// ============================================================
describe("StudyReportsPage — la pestaña se llama Sin asignar", () => {
  const sinAsignar = {
    sourceInboxItemId: "item-huerfano",
    detectedPatientName: "MP",
    detectedDni: null,
    studyDate: "2026-08-24T00:00:00.000Z",
    receivedAt: "2026-08-24T11:05:00.000Z",
    studySubtype: null,
    imageCount: 4,
    hasImages: false,
    needsPatient: false,
  };

  it("no dice 'sin dueño' en ningún texto de la pantalla", async () => {
    getMyStudyReports.mockResolvedValue([
      {
        sourceInboxItemId: "item-reclamado",
        report: null,
        state: "SIN_EMPEZAR",
        patientName: "PERALTA MARTA",
        patientDni: "40100204",
        studyDate: "2026-08-24T00:00:00.000Z",
        studyType: null,
        splitLabel: null,
        claimed: true,
      },
    ]);
    getStudyReportTemplates.mockResolvedValue([]);
    getOrphanStudies.mockResolvedValue([sinAsignar]);

    renderPage();

    expect(
      await screen.findByRole("tab", { name: /Sin asignar/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("tab", { name: /Sin dueño/i }),
    ).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("tab", { name: /Sin asignar/i }));
    await screen.findByText("MP");

    expect(document.body.textContent).not.toMatch(/sin due[ñn]o/i);
  });

  it("el cartel de error de la lista habla de estudios sin asignar", async () => {
    getMyStudyReports.mockResolvedValue([]);
    getStudyReportTemplates.mockResolvedValue([]);
    getOrphanStudies.mockRejectedValue(new Error("backend caído"));

    renderPage();
    await userEvent.click(await screen.findByRole("tab", { name: /Sin asignar/i }));

    expect(
      await screen.findByText(/No se pudo cargar la lista de estudios sin asignar/i),
    ).toBeInTheDocument();
  });

  it("soltar un estudio dice que vuelve a la lista de sin asignar", async () => {
    getMyStudyReports.mockResolvedValue([
      {
        sourceInboxItemId: "item-huerfano",
        report: null,
        state: "SIN_EMPEZAR",
        patientName: "PERALTA MARTA",
        patientDni: "40100204",
        studyDate: "2026-08-24T00:00:00.000Z",
        studyType: null,
        splitLabel: null,
        claimed: true,
      },
    ]);
    getStudyReportTemplates.mockResolvedValue([]);
    getOrphanStudies.mockResolvedValue([]);
    releaseOrphanStudy.mockResolvedValue({
      sourceInboxItemId: "item-huerfano",
      claimedByDoctorId: null,
      claimedAt: null,
      claimedPatientUserId: null,
    });
    const confirmar = vi.spyOn(window, "confirm").mockReturnValue(true);

    renderPage();
    await userEvent.click(await screen.findByRole("button", { name: /No es mío/i }));

    expect(confirmar).toHaveBeenCalledWith(
      expect.stringMatching(/estudios sin asignar/i),
    );
    confirmar.mockRestore();
  });
});

// ============================================================
// El buscador de "Sin asignar", visto desde la pantalla entera.
//
// Dos cosas que el filtro NO puede tocar:
//
// 1. El contador de la pestaña. Es el trabajo pendiente del centro —cuántos
//    estudios quedaron sin asignar—, no el resultado de lo que una escribió.
//    Si bajara al filtrar, la ecografista creería que se resolvieron solos.
// 2. Reclamar y soltar. El filtro es una lupa sobre la lista, no un modo
//    aparte: el circuito tiene que seguir funcionando igual con la búsqueda
//    puesta.
// ============================================================
describe("StudyReportsPage — el buscador de sin asignar", () => {
  const sinAsignar = (id: string, nombre: string, fecha: string) => ({
    sourceInboxItemId: id,
    detectedPatientName: nombre,
    detectedDni: null,
    studyDate: fecha,
    receivedAt: "2026-08-20T11:05:00.000Z",
    studySubtype: null,
    imageCount: 4,
    hasImages: false,
    needsPatient: false,
  });

  const tres = [
    sinAsignar("item-1", "PERALTA MARTA", "2026-08-20T00:00:00.000Z"),
    sinAsignar("item-2", "GOMEZ ANA", "2026-08-21T00:00:00.000Z"),
    sinAsignar("item-3", "SUAREZ JULIA", "2026-08-21T00:00:00.000Z"),
  ];

  it("el contador de la pestaña sigue mostrando el total, no lo filtrado", async () => {
    getMyStudyReports.mockResolvedValue([]);
    getStudyReportTemplates.mockResolvedValue([]);
    getOrphanStudies.mockResolvedValue(tres);

    renderPage();
    await userEvent.click(
      await screen.findByRole("tab", { name: /Sin asignar\s*3/i }),
    );
    await userEvent.type(screen.getByRole("searchbox"), "peralta");

    // Una sola tarjeta a la vista...
    expect(screen.getByText("PERALTA MARTA")).toBeInTheDocument();
    expect(screen.queryByText("GOMEZ ANA")).not.toBeInTheDocument();
    // ...y la pestaña sigue diciendo 3.
    expect(
      screen.getByRole("tab", { name: /Sin asignar\s*3/i }),
    ).toBeInTheDocument();
  });

  it("reclamar sigue funcionando con el filtro puesto", async () => {
    getMyStudyReports.mockResolvedValue([]);
    getStudyReportTemplates.mockResolvedValue([]);
    getOrphanStudies.mockResolvedValue(tres);
    claimOrphanStudy.mockResolvedValue({
      sourceInboxItemId: "item-2",
      claimedByDoctorId: "176",
      claimedAt: "2026-08-25T12:00:00.000Z",
      claimedPatientUserId: null,
    });

    renderPage();
    await userEvent.click(await screen.findByRole("tab", { name: /Sin asignar/i }));
    await userEvent.type(screen.getByRole("searchbox"), "gomez");

    await userEvent.click(await screen.findByRole("button", { name: /Es mío/i }));
    await userEvent.click(await screen.findByRole("button", { name: /Sí, es mío/i }));

    await waitFor(() =>
      expect(claimOrphanStudy).toHaveBeenCalledWith("item-2", undefined),
    );
    await waitFor(() => expect(getMyStudyReports).toHaveBeenCalledTimes(2));
  });

  it("soltar sigue funcionando después de haber filtrado", async () => {
    getMyStudyReports.mockResolvedValue([
      {
        sourceInboxItemId: "item-reclamado",
        report: null,
        state: "SIN_EMPEZAR",
        patientName: "PERALTA MARTA",
        patientDni: "40100204",
        studyDate: "2026-08-24T00:00:00.000Z",
        studyType: null,
        splitLabel: null,
        claimed: true,
      },
    ]);
    getStudyReportTemplates.mockResolvedValue([]);
    getOrphanStudies.mockResolvedValue(tres);
    releaseOrphanStudy.mockResolvedValue({
      sourceInboxItemId: "item-reclamado",
      claimedByDoctorId: null,
      claimedAt: null,
      claimedPatientUserId: null,
    });
    const confirmar = vi.spyOn(window, "confirm").mockReturnValue(true);

    renderPage();
    await userEvent.click(await screen.findByRole("tab", { name: /Sin asignar/i }));
    await userEvent.type(screen.getByRole("searchbox"), "gomez");
    await userEvent.click(screen.getByRole("tab", { name: /Por informar/i }));

    await userEvent.click(await screen.findByRole("button", { name: /No es mío/i }));

    await waitFor(() =>
      expect(releaseOrphanStudy).toHaveBeenCalledWith("item-reclamado"),
    );
    confirmar.mockRestore();
  });
});

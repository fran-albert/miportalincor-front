// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import StudyReportsPage from "./index";

const getMyStudyReports = vi.fn();
const getStudyReportTemplates = vi.fn();
const saveStudyReportDraft = vi.fn();
const getStudyReportImages = vi.fn();
const getStudyReportImagePreview = vi.fn();
const splitStudyReport = vi.fn();
const previewStudyReport = vi.fn();
const signStudyReport = vi.fn();

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
vi.mock("@/config/environment", () => ({
  environment: { API_INCOR_HC_URL: "https://api.test" },
}));

const renderPage = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <StudyReportsPage />
    </QueryClientProvider>,
  );
};

afterEach(() => vi.clearAllMocks());

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
  });
});

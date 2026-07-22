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

vi.mock("@/api/StudyReport/study-report.actions", () => ({
  getMyStudyReports: () => getMyStudyReports() as unknown,
  getStudyReportTemplates: () => getStudyReportTemplates() as unknown,
  saveStudyReportDraft: (id: string, key: string, content: unknown) =>
    saveStudyReportDraft(id, key, content) as unknown,
  getStudyReportImages: (id: string) => getStudyReportImages(id) as unknown,
  getStudyReportImagePreview: (id: string, instanceId: string) =>
    getStudyReportImagePreview(id, instanceId) as unknown,
  previewStudyReport: vi.fn(),
  signStudyReport: vi.fn(),
  addStudyReportAddendum: vi.fn(),
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

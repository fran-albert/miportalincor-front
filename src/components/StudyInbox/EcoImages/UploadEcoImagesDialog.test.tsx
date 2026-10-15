// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/hooks/Toast/toast-context";
import { ReceptionEcoItem } from "@/types/StudyReport/ReceptionEcoImages.types";
import { UploadEcoImagesDialog } from "./UploadEcoImagesDialog";

const uploadReceptionEcoImages = vi.fn();
const getReceptionEcoItemImages = vi.fn();
const deleteReceptionEcoImage = vi.fn();

vi.mock("@/api/StudyReport/reception-eco-images.actions", () => ({
  getReceptionEcoItems: () => Promise.resolve([]),
  getReceptionEcoItemImages: (id: string) =>
    getReceptionEcoItemImages(id) as unknown,
  getReceptionEcoImage: () => Promise.resolve(new Blob(["x"])),
  uploadReceptionEcoImages: (...args: unknown[]) =>
    uploadReceptionEcoImages(...args) as unknown,
  deleteReceptionEcoImage: (...args: unknown[]) =>
    deleteReceptionEcoImage(...args) as unknown,
}));
vi.mock("@/config/environment", () => ({
  environment: { API_INCOR_HC_URL: "https://api.test", NODE_ENV: "development" },
  currentConfig: { enableLogging: false, enableDevTools: false },
  isDevelopment: () => true,
  isStaging: () => false,
  isProduction: () => false,
}));

const baseItem: ReceptionEcoItem = {
  sourceInboxItemId: "item-1",
  patientName: "PEREZ ANA",
  patientDni: "30111222",
  studyDate: "2026-10-14T12:00:00.000Z",
  studyType: "ECO ABDOMINAL",
  doctorName: "Torri Andrea",
  reportState: "BORRADOR",
  reports: [{ id: "r1", splitLabel: null, status: "BORRADOR" }],
  uploadedImageCount: 0,
};

const jpg = (name = "eco.jpg") =>
  new File([new Uint8Array([0xff, 0xd8, 0xff])], name, { type: "image/jpeg" });

const renderDialog = (item: ReceptionEcoItem) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <ToastProvider>
      <QueryClientProvider client={client}>
        <UploadEcoImagesDialog item={item} onClose={() => undefined} />
      </QueryClientProvider>
    </ToastProvider>,
  );
};

beforeEach(() => {
  vi.stubGlobal("URL", {
    ...URL,
    createObjectURL: vi.fn(() => "blob:preview"),
    revokeObjectURL: vi.fn(),
  });
  getReceptionEcoItemImages.mockResolvedValue([]);
  uploadReceptionEcoImages.mockResolvedValue({
    uploaded: 1,
    pendingSignature: 1,
    attachedToHistory: 0,
  });
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("Subir imágenes de una eco", () => {
  it("sube las imágenes elegidas al estudio sin pedir informe si hay uno solo", async () => {
    renderDialog(baseItem);
    expect(
      screen.getByText(/salen en el PDF del informe cuando la médica lo firme/i),
    ).toBeInTheDocument();

    await userEvent.upload(screen.getByTestId("eco-images-input"), [
      jpg("a.jpg"),
      jpg("b.jpg"),
    ]);
    await userEvent.click(
      screen.getByRole("button", { name: "Subir 2 imágenes" }),
    );

    await waitFor(() =>
      expect(uploadReceptionEcoImages).toHaveBeenCalledWith(
        "item-1",
        [expect.any(File), expect.any(File)],
        [],
      ),
    );
  });

  it("muestra el día del estudio aunque la fecha llegue a medianoche UTC", () => {
    renderDialog({ ...baseItem, studyDate: "2026-10-14T00:00:00.000Z" });

    expect(screen.getByText(/14\/10\/2026/)).toBeInTheDocument();
  });

  it("avisa que en un informe firmado van a la historia y el PDF no cambia", () => {
    renderDialog({
      ...baseItem,
      reportState: "FIRMADO",
      reports: [{ id: "r1", splitLabel: null, status: "FIRMADO" }],
    });

    expect(
      screen.getByText(/se suman a la historia del paciente\. El PDF firmado no cambia/i),
    ).toBeInTheDocument();
  });

  it("con el turno dividido no deja subir hasta elegir el informe", async () => {
    renderDialog({
      ...baseItem,
      reports: [
        { id: "r1", splitLabel: "Mamaria", status: "BORRADOR" },
        { id: "r2", splitLabel: "Ginecológica", status: "BORRADOR" },
      ],
    });

    await userEvent.upload(screen.getByTestId("eco-images-input"), [jpg()]);
    const subir = screen.getByRole("button", { name: "Subir 1 imagen" });
    expect(subir).toBeDisabled();

    await userEvent.click(screen.getByLabelText(/Ginecológica/));
    expect(subir).toBeEnabled();
    await userEvent.click(subir);

    await waitFor(() =>
      expect(uploadReceptionEcoImages).toHaveBeenCalledWith(
        "item-1",
        [expect.any(File)],
        ["r2"],
      ),
    );
  });

  it("después de subir una tanda desmarca el informe para que la siguiente elija el suyo", async () => {
    renderDialog({
      ...baseItem,
      reports: [
        { id: "r1", splitLabel: "dvc", status: "BORRADOR" },
        { id: "r2", splitLabel: "abdomen", status: "BORRADOR" },
      ],
    });

    await userEvent.upload(screen.getByTestId("eco-images-input"), [jpg()]);
    await userEvent.click(screen.getByLabelText(/dvc/));
    await userEvent.click(screen.getByRole("button", { name: "Subir 1 imagen" }));
    await waitFor(() => expect(uploadReceptionEcoImages).toHaveBeenCalled());

    await waitFor(() =>
      expect(screen.getByLabelText(/dvc/)).not.toBeChecked(),
    );
    await userEvent.upload(screen.getByTestId("eco-images-input"), [jpg()]);
    expect(screen.getByRole("button", { name: "Subir 1 imagen" })).toBeDisabled();
  });

  it("descarta lo que no es imagen del ecógrafo", async () => {
    renderDialog(baseItem);

    await userEvent.upload(
      screen.getByTestId("eco-images-input"),
      [new File(["%PDF"], "informe.pdf", { type: "application/pdf" })],
      { applyAccept: false },
    );

    expect(
      screen.getByText("informe.pdf: no es JPG, PNG ni BMP"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Subir imágenes" })).toBeDisabled();
  });

  it("muestra las ya subidas y solo deja borrar las que no están en un documento", async () => {
    getReceptionEcoItemImages.mockResolvedValue([
      {
        id: "img-1",
        originalName: "a.jpg",
        studyReportId: null,
        splitLabel: null,
        attachedToHistory: false,
        canDelete: true,
        createdAt: "2026-10-14T12:00:00.000Z",
      },
      {
        id: "img-2",
        originalName: "b.jpg",
        studyReportId: "r1",
        splitLabel: null,
        attachedToHistory: true,
        canDelete: false,
        createdAt: "2026-10-14T12:00:00.000Z",
      },
    ]);
    deleteReceptionEcoImage.mockResolvedValue(undefined);
    renderDialog(baseItem);

    expect(await screen.findByText("En la historia")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Borrar b.jpg" }),
    ).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Borrar a.jpg" }));

    await waitFor(() =>
      expect(deleteReceptionEcoImage).toHaveBeenCalledWith("item-1", "img-1"),
    );
  });
});

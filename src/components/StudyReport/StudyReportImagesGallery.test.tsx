// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getStudyReportImages, getStudyReportImagePreview } from "@/api/StudyReport/study-report-images.actions";
import { StudyReportImagesGallery } from "./StudyReportImagesGallery";
import { clearImagePreviewCache } from "./imagePreviewCache";

vi.mock("@/api/StudyReport/study-report-images.actions", () => ({
  getStudyReportImages: vi.fn(),
  getStudyReportImagePreview: vi.fn(),
}));

describe("StudyReportImagesGallery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearImagePreviewCache();
    let urlNumber = 0;
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => `blob:image-${++urlNumber}`),
      revokeObjectURL: vi.fn(),
    });
  });

  it("muestra los previews en el orden del estudio y limita la concurrencia", async () => {
    vi.mocked(getStudyReportImages).mockResolvedValue([
      "instance-1",
      "instance-2",
      "instance-3",
      "instance-4",
      "instance-5",
      "instance-6",
    ]);
    let activeRequests = 0;
    let maxConcurrentRequests = 0;
    vi.mocked(getStudyReportImagePreview).mockImplementation(async () => {
      activeRequests += 1;
      maxConcurrentRequests = Math.max(maxConcurrentRequests, activeRequests);
      await new Promise((resolve) => window.setTimeout(resolve, 5));
      activeRequests -= 1;
      return new Blob(["jpg"], { type: "image/jpeg" });
    });

    const { unmount } = render(<StudyReportImagesGallery reportId="report-1" />);

    await waitFor(() => expect(screen.getAllByRole("img")).toHaveLength(6));
    expect(maxConcurrentRequests).toBeLessThanOrEqual(4);
    expect(screen.getAllByRole("img").map((image) => image.getAttribute("alt"))).toEqual([
      "Imagen 1 del estudio",
      "Imagen 2 del estudio",
      "Imagen 3 del estudio",
      "Imagen 4 del estudio",
      "Imagen 5 del estudio",
      "Imagen 6 del estudio",
    ]);

    unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(6);
  });

  it("muestra el estado vacío y permite ampliar una imagen", async () => {
    vi.mocked(getStudyReportImages).mockResolvedValue(["instance-1"]);
    vi.mocked(getStudyReportImagePreview).mockResolvedValue(
      new Blob(["jpg"], { type: "image/jpeg" }),
    );

    render(<StudyReportImagesGallery reportId="report-1" />);
    await waitFor(() => expect(screen.getByRole("img")).toBeInTheDocument());

    await userEvent.click(screen.getByRole("button", { name: /ver imagen 1/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    vi.mocked(getStudyReportImages).mockResolvedValue([]);
    const { rerender } = render(<StudyReportImagesGallery reportId="report-2" />);
    await waitFor(() => expect(screen.getByText(/sin imágenes/i)).toBeInTheDocument());
    rerender(<StudyReportImagesGallery reportId="report-2" />);
  });
  // Andrea, 22/10: con la conexión de la clínica cada imagen tarda segundos y
  // la galería esperaba a la última para mostrar algo.
  it("muestra cada imagen apenas llega, sin esperar a las demás", async () => {
    vi.mocked(getStudyReportImages).mockResolvedValue(["instance-1", "instance-2"]);
    let releaseSecond: () => void = () => undefined;
    vi.mocked(getStudyReportImagePreview).mockImplementation(async (_reportId, instanceId) => {
      if (instanceId === "instance-2") {
        await new Promise<void>((resolve) => {
          releaseSecond = resolve;
        });
      }
      return new Blob(["jpg"], { type: "image/jpeg" });
    });

    render(<StudyReportImagesGallery reportId="report-1" />);

    await waitFor(() => expect(screen.getAllByRole("img")).toHaveLength(1));
    expect(screen.queryByText(/cargando imágenes del estudio/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Cargando imagen 2")).toBeInTheDocument();

    releaseSecond();
    await waitFor(() => expect(screen.getAllByRole("img")).toHaveLength(2));
  });

  it("no vuelve a bajar una imagen que ya se vio en la sesión", async () => {
    vi.mocked(getStudyReportImages).mockResolvedValue(["instance-1", "instance-2"]);
    vi.mocked(getStudyReportImagePreview).mockResolvedValue(
      new Blob(["jpg"], { type: "image/jpeg" }),
    );

    const first = render(<StudyReportImagesGallery reportId="report-1" />);
    await waitFor(() => expect(screen.getAllByRole("img")).toHaveLength(2));
    first.unmount();

    render(<StudyReportImagesGallery reportId="report-1" />);
    await waitFor(() => expect(screen.getAllByRole("img")).toHaveLength(2));
    expect(getStudyReportImagePreview).toHaveBeenCalledTimes(2);
  });

  it("una imagen que falla se vuelve a pedir la próxima vez", async () => {
    vi.mocked(getStudyReportImages).mockResolvedValue(["instance-1"]);
    vi.mocked(getStudyReportImagePreview)
      .mockRejectedValueOnce(new Error("red"))
      .mockResolvedValue(new Blob(["jpg"], { type: "image/jpeg" }));

    const first = render(<StudyReportImagesGallery reportId="report-1" />);
    await waitFor(() => expect(screen.getByText(/no se pudo cargar/i)).toBeInTheDocument());
    first.unmount();

    render(<StudyReportImagesGallery reportId="report-1" />);
    await waitFor(() => expect(screen.getAllByRole("img")).toHaveLength(1));
    expect(getStudyReportImagePreview).toHaveBeenCalledTimes(2);
  });
});

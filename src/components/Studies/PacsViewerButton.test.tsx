// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  getStudyPacsImages,
  getStudyPacsImagePreview,
} from "@/api/Study/Pacs-Images/study-pacs-images.actions";
import { PacsViewerButton } from "./PacsViewerButton";

vi.mock("@/api/Study/Pacs-Images/study-pacs-images.actions", () => ({
  getStudyPacsImages: vi.fn(),
  getStudyPacsImagePreview: vi.fn(),
}));

describe("PacsViewerButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    let urlNumber = 0;
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => `blob:study-image-${++urlNumber}`),
      revokeObjectURL: vi.fn(),
    });
  });

  it("no se muestra si el estudio no tiene imágenes DICOM", () => {
    const { container } = render(
      <PacsViewerButton studyId={1} studyInstanceUID={null} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("no se muestra si studyInstanceUID viene undefined", () => {
    const { container } = render(<PacsViewerButton studyId={1} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("abre la galería en un modal con las imágenes del estudio", async () => {
    vi.mocked(getStudyPacsImages).mockResolvedValue(["inst-1", "inst-2"]);
    vi.mocked(getStudyPacsImagePreview).mockResolvedValue(
      new Blob(["jpg"], { type: "image/jpeg" }),
    );

    render(<PacsViewerButton studyId={42} studyInstanceUID="2.25.1" />);
    await userEvent.click(
      screen.getByRole("button", { name: /ver imágenes/i }),
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByText("Imágenes de la ecografía"),
    ).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByRole("img")).toHaveLength(2));
    expect(getStudyPacsImages).toHaveBeenCalledWith(42);
  });

  it("muestra el estado vacío cuando el PACS no devuelve imágenes", async () => {
    vi.mocked(getStudyPacsImages).mockResolvedValue([]);

    render(<PacsViewerButton studyId={42} studyInstanceUID="2.25.1" />);
    await userEvent.click(
      screen.getByRole("button", { name: /ver imágenes/i }),
    );

    await waitFor(() =>
      expect(screen.getByText(/sin imágenes/i)).toBeInTheDocument(),
    );
  });
});

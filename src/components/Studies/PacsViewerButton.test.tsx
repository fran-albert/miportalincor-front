// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PacsViewerButton } from "./PacsViewerButton";

const mockCreateSession = vi.fn();
vi.mock("@/api/Study/Pacs-Viewer/create-viewer-session.action", () => ({
  createPacsViewerSession: (studyId: number | string) =>
    mockCreateSession(studyId) as unknown,
}));
vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("PacsViewerButton", () => {
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

  it("abre el visor en una pestaña nueva con la URL de la sesión", async () => {
    mockCreateSession.mockResolvedValue({
      viewerUrl:
        "https://api.test/pacs-viewer/tok/stone-webviewer/index.html?study=2.25.1",
      expiresInSeconds: 1800,
    });
    const fakeWindow = { location: { href: "" }, close: vi.fn() };
    const openSpy = vi
      .spyOn(window, "open")
      .mockReturnValue(fakeWindow as unknown as Window);

    render(<PacsViewerButton studyId={42} studyInstanceUID="2.25.1" />);
    fireEvent.click(
      screen.getByRole("button", { name: /ver imágenes/i }),
    );

    // La pestaña se abre ANTES de resolver la sesión (popup blocker).
    expect(openSpy).toHaveBeenCalledWith("", "_blank");

    await waitFor(() => {
      expect(mockCreateSession).toHaveBeenCalledWith(42);
      expect(fakeWindow.location.href).toContain(
        "stone-webviewer/index.html?study=2.25.1",
      );
    });
  });

  it("si la sesión falla, cierra la pestaña y avisa", async () => {
    mockCreateSession.mockRejectedValue(new Error("403"));
    const fakeWindow = { location: { href: "" }, close: vi.fn() };
    vi.spyOn(window, "open").mockReturnValue(
      fakeWindow as unknown as Window,
    );

    render(<PacsViewerButton studyId={42} studyInstanceUID="2.25.1" />);
    fireEvent.click(
      screen.getByRole("button", { name: /ver imágenes/i }),
    );

    await waitFor(() => {
      expect(fakeWindow.close).toHaveBeenCalled();
    });
    expect(fakeWindow.location.href).toBe("");
  });
});

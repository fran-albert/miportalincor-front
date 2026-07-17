// @vitest-environment jsdom
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { PacsImagesGrid } from "./PacsImagesGrid";

const mockGetImages = vi.fn();
const mockGetPreview = vi.fn();
vi.mock("@/api/StudyInbox/get-study-inbox-pacs-images.action", () => ({
  getStudyInboxPacsImages: (id: string) => mockGetImages(id) as unknown,
}));
vi.mock("@/api/StudyInbox/get-study-inbox-pacs-image-preview.action", () => ({
  getStudyInboxPacsImagePreview: (id: string, instanceId: string) =>
    mockGetPreview(id, instanceId) as unknown,
}));

// jsdom no implementa object URLs
beforeAll(() => {
  URL.createObjectURL = vi.fn(() => "blob:mock-url");
  URL.revokeObjectURL = vi.fn();
});

const renderGrid = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <PacsImagesGrid itemId="item-1" />
    </QueryClientProvider>,
  );
};

describe("PacsImagesGrid", () => {
  beforeEach(() => {
    mockGetImages.mockReset();
    mockGetPreview.mockReset();
    mockGetPreview.mockResolvedValue(new Blob(["jpg"], { type: "image/jpeg" }));
  });

  it("muestra un thumbnail por cada imagen del estudio", async () => {
    mockGetImages.mockResolvedValue(["inst-1", "inst-2"]);

    renderGrid();

    await waitFor(() => {
      expect(screen.getAllByRole("img")).toHaveLength(2);
    });
    expect(mockGetImages).toHaveBeenCalledWith("item-1");
    expect(mockGetPreview).toHaveBeenCalledWith("item-1", "inst-1");
    expect(mockGetPreview).toHaveBeenCalledWith("item-1", "inst-2");
  });

  it("con lista vacía avisa que no hay imágenes", async () => {
    mockGetImages.mockResolvedValue([]);

    renderGrid();

    await waitFor(() => {
      expect(screen.getByText(/sin imágenes/i)).toBeInTheDocument();
    });
  });

  it("si falla el listado muestra el error y permite reintentar", async () => {
    mockGetImages.mockRejectedValue(new Error("Network Error"));

    renderGrid();

    await waitFor(() => {
      expect(
        screen.getByText(/no se pudieron cargar las imágenes/i),
      ).toBeInTheDocument();
    });

    mockGetImages.mockResolvedValue(["inst-1"]);
    fireEvent.click(screen.getByRole("button", { name: /reintentar/i }));

    await waitFor(() => {
      expect(screen.getAllByRole("img")).toHaveLength(1);
    });
  });
});

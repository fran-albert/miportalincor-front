// @vitest-environment jsdom
// ============================================================
// La lista de estudios sin dueño.
//
// El 24/08 Andrea Torri hizo una eco un día sin agenda abierta: el estudio
// llegó del ecógrafo sin AccessionNumber y no apareció en su cola. Había 88
// así. Esta lista existe para que reconozca el suyo y lo reclame sola, sin
// depender de que alguien lo rescate con SQL.
//
// Lo que tiene que estar en pantalla es lo que le permite reconocerlo: cuándo
// se hizo, qué nombre quedó cargado en el equipo y cuántas imágenes tiene.
// ============================================================

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { OrphanStudiesList } from "./OrphanStudiesList";
import type { OrphanStudy } from "@/types/StudyReport/StudyReport.types";

const getOrphanStudyImages = vi.fn();
const getOrphanStudyImagePreview = vi.fn();

vi.mock("@/api/StudyReport/study-report.actions", () => ({
  getOrphanStudyImages: (id: string) => getOrphanStudyImages(id) as unknown,
  getOrphanStudyImagePreview: (id: string, instanceId: string) =>
    getOrphanStudyImagePreview(id, instanceId) as unknown,
}));

beforeAll(() => {
  URL.createObjectURL = vi.fn(() => "blob:orphan-thumb");
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => vi.clearAllMocks());

const huerfano = (overrides: Partial<OrphanStudy> = {}): OrphanStudy => ({
  sourceInboxItemId: "item-1",
  detectedPatientName: "MP",
  detectedDni: null,
  studyDate: "2026-08-24T00:00:00.000Z",
  receivedAt: "2026-08-24T11:05:00.000Z",
  studySubtype: null,
  imageCount: 12,
  hasImages: true,
  needsPatient: true,
  ...overrides,
});

describe("OrphanStudiesList", () => {
  it("muestra los datos con los que la ecografista reconoce el estudio suyo", () => {
    render(
      <OrphanStudiesList
        studies={[huerfano()]}
        isLoading={false}
        onClaim={vi.fn()}
      />,
    );

    expect(screen.getByText("24/08/2026")).toBeInTheDocument();
    expect(screen.getByText("MP")).toBeInTheDocument();
    expect(screen.getByText(/12 imágenes/)).toBeInTheDocument();
  });

  it("avisa cuando el nombre que quedó cargado no sirve para identificar", () => {
    render(
      <OrphanStudiesList
        studies={[huerfano()]}
        isLoading={false}
        onClaim={vi.fn()}
      />,
    );

    expect(screen.getByText(/Sin paciente identificado/i)).toBeInTheDocument();
  });

  it("muestra el nombre detectado cuando el equipo lo trajo completo", () => {
    render(
      <OrphanStudiesList
        studies={[
          huerfano({
            detectedPatientName: "PERALTA MARTA",
            needsPatient: false,
          }),
        ]}
        isLoading={false}
        onClaim={vi.fn()}
      />,
    );

    expect(screen.getByText("PERALTA MARTA")).toBeInTheDocument();
    expect(
      screen.queryByText(/Sin paciente identificado/i),
    ).not.toBeInTheDocument();
  });

  it("reclama el estudio que la médica eligió", async () => {
    const onClaim = vi.fn();
    const user = userEvent.setup();
    render(
      <OrphanStudiesList
        studies={[huerfano()]}
        isLoading={false}
        onClaim={onClaim}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Es mío/i }));

    expect(onClaim).toHaveBeenCalledWith(
      expect.objectContaining({ sourceInboxItemId: "item-1" }),
    );
  });

  it("dice que no hay nada cuando la lista está vacía", () => {
    render(
      <OrphanStudiesList studies={[]} isLoading={false} onClaim={vi.fn()} />,
    );

    expect(screen.getByText(/No hay estudios sin dueño/i)).toBeInTheDocument();
  });

  it("baja la miniatura del PACS para el estudio que tiene imágenes", async () => {
    getOrphanStudyImages.mockResolvedValue(["inst-1", "inst-2"]);
    getOrphanStudyImagePreview.mockResolvedValue(new Blob(["jpeg"]));

    render(
      <OrphanStudiesList
        studies={[huerfano()]}
        isLoading={false}
        onClaim={vi.fn()}
      />,
    );

    await waitFor(() =>
      expect(getOrphanStudyImages).toHaveBeenCalledWith("item-1"),
    );
    // Una sola miniatura por tarjeta: la lista puede tener decenas de estudios
    // y bajar todas las imágenes de cada uno la dejaría inusable en el celular.
    await waitFor(() =>
      expect(getOrphanStudyImagePreview).toHaveBeenCalledTimes(1),
    );
    expect(getOrphanStudyImagePreview).toHaveBeenCalledWith("item-1", "inst-1");
  });

  it("no sale a buscar imágenes de un estudio que no las tiene", async () => {
    render(
      <OrphanStudiesList
        studies={[huerfano({ hasImages: false, imageCount: 0 })]}
        isLoading={false}
        onClaim={vi.fn()}
      />,
    );

    await waitFor(() => expect(screen.getByText("MP")).toBeInTheDocument());
    expect(getOrphanStudyImages).not.toHaveBeenCalled();
  });
});

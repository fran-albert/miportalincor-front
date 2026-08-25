// @vitest-environment jsdom
// ============================================================
// El diálogo de "es mío".
//
// Reclamar es la decisión delicada de esta feature: la médica mira una lista
// de estudios que POR DEFINICIÓN no son de nadie —dos del mismo día, nombres
// parecidos, una miniatura que no se distingue— así que el diálogo tiene que
// darle todo lo que hay antes de que confirme.
//
// Y para el ~11% que llega sin nombre útil ("MP", vacío) hace falta además
// elegir el paciente del padrón: es el mismo paso que hoy se hace a mano.
// ============================================================

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { ClaimOrphanDialog } from "./ClaimOrphanDialog";
import type { OrphanStudy } from "@/types/StudyReport/StudyReport.types";

const getOrphanStudyImages = vi.fn();
const getOrphanStudyImagePreview = vi.fn();

vi.mock("@/api/StudyReport/study-report.actions", () => ({
  getOrphanStudyImages: (id: string) => getOrphanStudyImages(id) as unknown,
  getOrphanStudyImagePreview: (id: string, instanceId: string) =>
    getOrphanStudyImagePreview(id, instanceId) as unknown,
}));

// El buscador del padrón ya existe y se usa en toda la app; acá interesa que
// el diálogo lo cablee bien, no re-testear el combobox.
vi.mock("@/components/Appointments/Select/PatientSelect", () => ({
  PatientSelect: ({
    onValueChange,
    initialSearch,
  }: {
    onValueChange: (patientId: number) => void;
    initialSearch?: string;
  }) => (
    <div>
      <span data-testid="busqueda-precargada">{initialSearch ?? ""}</span>
      <button type="button" onClick={() => onValueChange(5001)}>
        Elegir a PERALTA MARTA
      </button>
    </div>
  ),
}));

beforeAll(() => {
  URL.createObjectURL = vi.fn(() => "blob:orphan-image");
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
  imageCount: 2,
  hasImages: true,
  needsPatient: true,
  ...overrides,
});

const renderDialog = (
  study: OrphanStudy,
  onConfirm = vi.fn(),
  isPending = false,
) => {
  render(
    <ClaimOrphanDialog
      study={study}
      isPending={isPending}
      onConfirm={onConfirm}
      onCancel={vi.fn()}
    />,
  );
  return onConfirm;
};

describe("ClaimOrphanDialog", () => {
  it("no deja reclamar hasta elegir el paciente cuando el estudio llegó sin nombre útil", async () => {
    const onConfirm = renderDialog(huerfano());

    const confirmar = screen.getByRole("button", { name: /Sí, es mío/i });
    expect(confirmar).toBeDisabled();

    await userEvent.click(
      screen.getByRole("button", { name: /Elegir a PERALTA MARTA/i }),
    );

    await waitFor(() => expect(confirmar).toBeEnabled());
    await userEvent.click(confirmar);
    expect(onConfirm).toHaveBeenCalledWith("5001");
  });

  it("reclama sin preguntar cuando el padrón ya resolvió al paciente", async () => {
    const onConfirm = renderDialog(
      huerfano({ needsPatient: false, detectedPatientName: "PERALTA MARTA" }),
    );

    const confirmar = screen.getByRole("button", { name: /Sí, es mío/i });
    expect(confirmar).toBeEnabled();

    await userEvent.click(confirmar);
    expect(onConfirm).toHaveBeenCalledWith(undefined);
  });

  it("avisa que reclamar no firma nada y que se puede deshacer", () => {
    renderDialog(huerfano({ needsPatient: false }));

    expect(screen.getByText(/se puede soltar/i)).toBeInTheDocument();
  });

  it("muestra todas las imágenes del estudio para decidir con algo en la mano", async () => {
    getOrphanStudyImages.mockResolvedValue(["inst-1", "inst-2"]);
    getOrphanStudyImagePreview.mockResolvedValue(new Blob(["jpeg"]));

    renderDialog(huerfano({ needsPatient: false }));

    await waitFor(() =>
      expect(getOrphanStudyImagePreview).toHaveBeenCalledTimes(2),
    );
    expect(await screen.findAllByRole("img")).toHaveLength(2);
  });

  it("no habilita el botón mientras el reclamo está en vuelo", () => {
    renderDialog(huerfano({ needsPatient: false }), vi.fn(), true);

    expect(screen.getByRole("button", { name: /Sí, es mío/i })).toBeDisabled();
  });
});

// ============================================================
// El buscador arranca donde la ecografista ya está mirando.
//
// El diálogo MOSTRABA el nombre detectado y justo debajo un buscador vacío:
// tenía que re-tipear a mano lo que ya tenía en pantalla, y encima traducir
// "BARRAZA,ALBINA" a algo que el padrón entienda.
// ============================================================
describe("ClaimOrphanDialog — precarga del buscador", () => {
  const precargado = () =>
    screen.getByTestId("busqueda-precargada").textContent;

  it("abre buscando por el nombre que quedó cargado en el equipo", () => {
    renderDialog(huerfano({ detectedPatientName: "BARRAZA,ALBINA" }));

    expect(precargado()).toBe("BARRAZA ALBINA");
  });

  it("normaliza el circunflejo de DICOM antes de buscar", () => {
    renderDialog(huerfano({ detectedPatientName: "SILVANI^MARIA XIMENA" }));

    expect(precargado()).toBe("SILVANI MARIA XIMENA");
  });

  it("no precarga nada cuando el nombre del equipo no sirve para buscar", () => {
    // "MP" es de los casos que llegan sin nombre útil: precargarlo dejaría
    // basura que hay que borrar antes de escribir.
    renderDialog(huerfano({ detectedPatientName: "MP" }));

    expect(precargado()).toBe("");
  });

  it("no precarga nada cuando el equipo no mandó nombre", () => {
    renderDialog(huerfano({ detectedPatientName: null }));

    expect(precargado()).toBe("");
  });

  it("no dice que el estudio llegó sin datos cuando sí traía un nombre", () => {
    // El diálogo explicaba "llegó sin datos para identificar al paciente"
    // justo arriba del nombre que el equipo sí había mandado.
    renderDialog(huerfano({ detectedPatientName: "BARRAZA,ALBINA" }));

    expect(screen.queryByText(/llegó sin datos/i)).not.toBeInTheDocument();
    expect(screen.getByText(/no coincide con.*padrón/i)).toBeInTheDocument();
  });
});

// @vitest-environment jsdom
import { beforeAll, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { EcoSubtypeDialog } from "./EcoSubtypeDialog";
import type { QueueEntry } from "@/types/Queue";

const mockUseEcoSubtypes = vi.fn();
vi.mock("@/hooks/ConsultationType", () => ({
  useEcoSubtypes: (options?: { enabled?: boolean }) =>
    mockUseEcoSubtypes(options) as unknown,
}));

// cmdk llama scrollIntoView sobre el item activo; jsdom no lo implementa.
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

const entry = {
  id: 1,
  appointmentId: 4321,
  appointmentType: "SCHEDULED_APPOINTMENT",
  patientName: "PEREZ JUAN",
  patientDocument: "12345678",
  doctorName: "TORRI ANDREA",
  necesitaSubtipoEco: true,
} as unknown as QueueEntry;

const subtypes = [
  { id: 20, name: "ECOGRAFIA ABDOMEN" },
  { id: 25, name: "Ecografia MAMARIA" },
];

const renderDialog = (props: Partial<Parameters<typeof EcoSubtypeDialog>[0]>) =>
  render(
    <EcoSubtypeDialog
      entry={entry}
      confirmLabel="Guardar y llamar"
      onCancel={vi.fn()}
      onConfirm={vi.fn()}
      onSkip={vi.fn()}
      isSaving={false}
      {...props}
    />,
  );

const option = (name: RegExp) => screen.getByRole("option", { name });

describe("EcoSubtypeDialog", () => {
  it("no permite confirmar sin elegir un subtipo", () => {
    mockUseEcoSubtypes.mockReturnValue({ ecoSubtypes: subtypes, isLoading: false });
    const onConfirm = vi.fn();

    renderDialog({ onConfirm });

    const confirmButton = screen.getByRole("button", { name: /guardar y llamar/i });
    expect(confirmButton).toBeDisabled();

    fireEvent.click(confirmButton);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("al elegir un subtipo habilita y confirma con su id en un array", () => {
    mockUseEcoSubtypes.mockReturnValue({ ecoSubtypes: subtypes, isLoading: false });
    const onConfirm = vi.fn();

    renderDialog({ onConfirm });

    fireEvent.click(option(/ecografia mamaria/i));
    const confirmButton = screen.getByRole("button", { name: /guardar y llamar/i });
    expect(confirmButton).toBeEnabled();

    fireEvent.click(confirmButton);
    expect(onConfirm).toHaveBeenCalledWith([25]);
  });

  it("permite elegir varios subtipos y confirma con todos los ids", () => {
    mockUseEcoSubtypes.mockReturnValue({ ecoSubtypes: subtypes, isLoading: false });
    const onConfirm = vi.fn();

    renderDialog({ onConfirm });

    fireEvent.click(option(/ecografia abdomen/i));
    fireEvent.click(option(/ecografia mamaria/i));
    fireEvent.click(screen.getByRole("button", { name: /guardar y llamar/i }));

    expect(onConfirm).toHaveBeenCalledWith([20, 25]);
  });

  it("filtra los tipos por lo que se escribe en el buscador", () => {
    mockUseEcoSubtypes.mockReturnValue({ ecoSubtypes: subtypes, isLoading: false });

    renderDialog({});

    fireEvent.change(screen.getByPlaceholderText(/escribí el tipo/i), {
      target: { value: "mama" },
    });

    expect(screen.getByRole("option", { name: /ecografia mamaria/i })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /ecografia abdomen/i })).toBeNull();
  });

  it("permite quitar un tipo elegido desde su chip", () => {
    mockUseEcoSubtypes.mockReturnValue({ ecoSubtypes: subtypes, isLoading: false });
    const onConfirm = vi.fn();

    renderDialog({ onConfirm });

    fireEvent.click(option(/ecografia mamaria/i));
    fireEvent.click(screen.getByRole("button", { name: /quitar ecografia mamaria/i }));

    expect(screen.getByRole("button", { name: /guardar y llamar/i })).toBeDisabled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("cancelar no confirma nada", () => {
    mockUseEcoSubtypes.mockReturnValue({ ecoSubtypes: subtypes, isLoading: false });
    const onCancel = vi.fn();
    const onConfirm = vi.fn();

    renderDialog({ onCancel, onConfirm });

    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onCancel).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("con catálogo vacío ofrece continuar sin definir (fallback operativo)", () => {
    mockUseEcoSubtypes.mockReturnValue({ ecoSubtypes: [], isLoading: false });
    const onSkip = vi.fn();

    renderDialog({ onSkip });

    fireEvent.click(screen.getByRole("button", { name: /continuar sin definir/i }));
    expect(onSkip).toHaveBeenCalled();
  });

  it("si falla la carga del catálogo NO ofrece continuar sin definir", () => {
    mockUseEcoSubtypes.mockReturnValue({
      ecoSubtypes: [],
      isLoading: false,
      error: new Error("Network Error"),
      refetch: vi.fn(),
    });

    renderDialog({});

    expect(
      screen.queryByRole("button", { name: /continuar sin definir/i }),
    ).toBeNull();
    expect(screen.queryByText(/no hay subtipos de ecografía configurados/i)).toBeNull();
    expect(
      screen.getByText(/no se pudieron cargar los tipos/i),
    ).toBeInTheDocument();
  });

  it("si falla la carga del catálogo permite reintentar", () => {
    const refetch = vi.fn();
    mockUseEcoSubtypes.mockReturnValue({
      ecoSubtypes: [],
      isLoading: false,
      error: new Error("Network Error"),
      refetch,
    });

    renderDialog({});

    fireEvent.click(screen.getByRole("button", { name: /reintentar/i }));
    expect(refetch).toHaveBeenCalled();
  });

  it("muestra el nombre del paciente y de la médica", () => {
    mockUseEcoSubtypes.mockReturnValue({ ecoSubtypes: subtypes, isLoading: false });

    renderDialog({});

    expect(screen.getByText(/PEREZ JUAN/)).toBeInTheDocument();
    expect(screen.getByText(/TORRI ANDREA/)).toBeInTheDocument();
  });
});

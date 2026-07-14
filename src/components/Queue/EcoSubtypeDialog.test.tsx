// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EcoSubtypeDialog } from "./EcoSubtypeDialog";
import type { QueueEntry } from "@/types/Queue";

const mockUseEcoSubtypes = vi.fn();
vi.mock("@/hooks/ConsultationType", () => ({
  useEcoSubtypes: (options?: { enabled?: boolean }) =>
    mockUseEcoSubtypes(options) as unknown,
}));

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

describe("EcoSubtypeDialog", () => {
  it("no permite confirmar sin elegir un subtipo", () => {
    mockUseEcoSubtypes.mockReturnValue({
      ecoSubtypes: subtypes,
      isLoading: false,
    });
    const onConfirm = vi.fn();

    render(
      <EcoSubtypeDialog
        entry={entry}
        confirmLabel="Guardar y llamar"
        onCancel={vi.fn()}
        onConfirm={onConfirm}
        onSkip={vi.fn()}
        isSaving={false}
      />,
    );

    const confirmButton = screen.getByRole("button", {
      name: /guardar y llamar/i,
    });
    expect(confirmButton).toBeDisabled();

    fireEvent.click(confirmButton);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("al elegir un subtipo habilita y confirma con su id en un array", () => {
    mockUseEcoSubtypes.mockReturnValue({
      ecoSubtypes: subtypes,
      isLoading: false,
    });
    const onConfirm = vi.fn();

    render(
      <EcoSubtypeDialog
        entry={entry}
        confirmLabel="Guardar y llamar"
        onCancel={vi.fn()}
        onConfirm={onConfirm}
        onSkip={vi.fn()}
        isSaving={false}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /ecografia mamaria/i }),
    );
    const confirmButton = screen.getByRole("button", {
      name: /guardar y llamar/i,
    });
    expect(confirmButton).toBeEnabled();

    fireEvent.click(confirmButton);
    expect(onConfirm).toHaveBeenCalledWith([25]);
  });

  it("permite elegir varios subtipos y confirma con todos los ids", () => {
    mockUseEcoSubtypes.mockReturnValue({
      ecoSubtypes: subtypes,
      isLoading: false,
    });
    const onConfirm = vi.fn();

    render(
      <EcoSubtypeDialog
        entry={entry}
        confirmLabel="Guardar y llamar"
        onCancel={vi.fn()}
        onConfirm={onConfirm}
        onSkip={vi.fn()}
        isSaving={false}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /ecografia abdomen/i }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: /ecografia mamaria/i }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: /guardar y llamar/i }),
    );

    expect(onConfirm).toHaveBeenCalledWith([20, 25]);
  });

  it("al tocar dos veces un subtipo lo deselecciona", () => {
    mockUseEcoSubtypes.mockReturnValue({
      ecoSubtypes: subtypes,
      isLoading: false,
    });
    const onConfirm = vi.fn();

    render(
      <EcoSubtypeDialog
        entry={entry}
        confirmLabel="Guardar y llamar"
        onCancel={vi.fn()}
        onConfirm={onConfirm}
        onSkip={vi.fn()}
        isSaving={false}
      />,
    );

    const mamaria = screen.getByRole("button", { name: /ecografia mamaria/i });
    fireEvent.click(mamaria);
    fireEvent.click(mamaria);

    expect(
      screen.getByRole("button", { name: /guardar y llamar/i }),
    ).toBeDisabled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("cancelar no confirma nada", () => {
    mockUseEcoSubtypes.mockReturnValue({
      ecoSubtypes: subtypes,
      isLoading: false,
    });
    const onCancel = vi.fn();
    const onConfirm = vi.fn();

    render(
      <EcoSubtypeDialog
        entry={entry}
        confirmLabel="Guardar y llamar"
        onCancel={onCancel}
        onConfirm={onConfirm}
        onSkip={vi.fn()}
        isSaving={false}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onCancel).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("con catálogo vacío ofrece continuar sin definir (fallback operativo)", () => {
    mockUseEcoSubtypes.mockReturnValue({ ecoSubtypes: [], isLoading: false });
    const onSkip = vi.fn();

    render(
      <EcoSubtypeDialog
        entry={entry}
        confirmLabel="Guardar y llamar"
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
        onSkip={onSkip}
        isSaving={false}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /continuar sin definir/i }),
    );
    expect(onSkip).toHaveBeenCalled();
  });

  it("muestra el nombre del paciente y de la médica", () => {
    mockUseEcoSubtypes.mockReturnValue({
      ecoSubtypes: subtypes,
      isLoading: false,
    });

    render(
      <EcoSubtypeDialog
        entry={entry}
        confirmLabel="Guardar y llamar"
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
        onSkip={vi.fn()}
        isSaving={false}
      />,
    );

    expect(screen.getByText(/PEREZ JUAN/)).toBeInTheDocument();
    expect(screen.getByText(/TORRI ANDREA/)).toBeInTheDocument();
  });
});

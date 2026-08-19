// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { ConsultationTypeDialog } from "./ConsultationTypeDialog";
import type { ConsultationType } from "@/types/ConsultationType/ConsultationType";

const createType = vi.fn();
const updateType = vi.fn();

vi.mock("@/hooks/ConsultationType", () => ({
  useAllConsultationTypes: () => ({ consultationTypes: [], isLoading: false }),
  useOwnConsultationTypes: () => ({ consultationTypes: [], isLoading: false }),
  useCreateConsultationType: () => ({ mutateAsync: createType, isPending: false }),
  useUpdateConsultationType: () => ({ mutateAsync: updateType, isPending: false }),
}));

vi.mock("@/hooks/Toast/toast-context", () => ({
  useToastContext: () => ({ showSuccess: vi.fn(), showError: vi.fn() }),
}));

const buildType = (overrides: Partial<ConsultationType> = {}): ConsultationType => ({
  id: 41,
  name: "Doppler fetal",
  defaultDurationMinutes: 30,
  color: "#2563EB",
  isActive: true,
  displayOrder: 0,
  isEcoSubtype: false,
  isIntegralCheckupEco: false,
  createdAt: "2026-08-11T10:00:00Z",
  updatedAt: "2026-08-11T10:00:00Z",
  ...overrides,
});

const ecoSwitch = () => screen.getByRole("switch", { name: /subtipo de ecografía/i });
const integralSwitch = () =>
  screen.getByRole("switch", { name: /control ginecológico integral/i });

describe("ConsultationTypeDialog — flag de subtipo de eco", () => {
  beforeEach(() => {
    createType.mockReset().mockResolvedValue(buildType());
    updateType.mockReset().mockResolvedValue(buildType());
  });

  it("crea el tipo marcado como subtipo de eco sin tocar ninguna env", async () => {
    render(
      <ConsultationTypeDialog open onOpenChange={vi.fn()} consultationType={null} />,
    );

    fireEvent.change(screen.getByLabelText("Nombre *"), {
      target: { value: "Doppler renal" },
    });
    fireEvent.click(ecoSwitch());
    fireEvent.click(screen.getByRole("button", { name: /crear tipo/i }));

    await waitFor(() => expect(createType).toHaveBeenCalled());
    expect(createType).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Doppler renal", isEcoSubtype: true }),
    );
  });

  it("por defecto un tipo nuevo no es subtipo de eco", async () => {
    render(
      <ConsultationTypeDialog open onOpenChange={vi.fn()} consultationType={null} />,
    );

    fireEvent.change(screen.getByLabelText("Nombre *"), {
      target: { value: "Ergometría" },
    });
    fireEvent.click(screen.getByRole("button", { name: /crear tipo/i }));

    await waitFor(() => expect(createType).toHaveBeenCalled());
    expect(createType).toHaveBeenCalledWith(
      expect.objectContaining({ isEcoSubtype: false }),
    );
  });

  it("al editar arranca con el flag que ya tiene el tipo y lo puede apagar", async () => {
    render(
      <ConsultationTypeDialog
        open
        onOpenChange={vi.fn()}
        consultationType={buildType({ isEcoSubtype: true })}
      />,
    );

    expect(ecoSwitch()).toBeChecked();

    fireEvent.click(ecoSwitch());
    fireEvent.click(screen.getByRole("button", { name: /guardar cambios/i }));

    await waitFor(() => expect(updateType).toHaveBeenCalled());
    expect(updateType).toHaveBeenCalledWith({
      id: 41,
      dto: expect.objectContaining({ isEcoSubtype: false }),
    });
  });
});

/**
 * Qué ecografías puede pedir la ginecóloga en el control.
 *
 * Va por ABM y no por una lista en el código a propósito: la lista de Tudela
 * son 6 hoy y va a cambiar. Con la lista en código cada cambio sería un
 * deploy; con el flag, es un switch en esta pantalla.
 */
describe("ConsultationTypeDialog — flag del control integral", () => {
  beforeEach(() => {
    createType.mockReset().mockResolvedValue(buildType());
    updateType.mockReset().mockResolvedValue(buildType());
  });

  it("marca una eco como solicitable en el control", async () => {
    render(
      <ConsultationTypeDialog open onOpenChange={vi.fn()} consultationType={null} />,
    );

    fireEvent.change(screen.getByLabelText("Nombre *"), {
      target: { value: "Ecografía Transvaginal" },
    });
    // Primero es una ecografía; recién ahí se le puede decir que la
    // ginecóloga la puede pedir en el control.
    fireEvent.click(ecoSwitch());
    fireEvent.click(integralSwitch());
    fireEvent.click(screen.getByRole("button", { name: /crear tipo/i }));

    await waitFor(() => expect(createType).toHaveBeenCalled());
    expect(createType).toHaveBeenCalledWith(
      expect.objectContaining({
        isEcoSubtype: true,
        isIntegralCheckupEco: true,
      }),
    );
  });

  it("por defecto un tipo nuevo no se puede pedir en el control", async () => {
    render(
      <ConsultationTypeDialog open onOpenChange={vi.fn()} consultationType={null} />,
    );

    fireEvent.change(screen.getByLabelText("Nombre *"), {
      target: { value: "Ergometría" },
    });
    fireEvent.click(screen.getByRole("button", { name: /crear tipo/i }));

    await waitFor(() => expect(createType).toHaveBeenCalled());
    expect(createType).toHaveBeenCalledWith(
      expect.objectContaining({ isIntegralCheckupEco: false }),
    );
  });

  it("al editar arranca con el flag que ya tiene y se puede sacar de la lista", async () => {
    render(
      <ConsultationTypeDialog
        open
        onOpenChange={vi.fn()}
        consultationType={buildType({
          isEcoSubtype: true,
          isIntegralCheckupEco: true,
        })}
      />,
    );

    expect(integralSwitch()).toBeChecked();

    fireEvent.click(integralSwitch());
    fireEvent.click(screen.getByRole("button", { name: /guardar cambios/i }));

    await waitFor(() => expect(updateType).toHaveBeenCalled());
    expect(updateType).toHaveBeenCalledWith({
      id: 41,
      dto: expect.objectContaining({ isIntegralCheckupEco: false }),
    });
  });
});

/**
 * El switch del control solo tiene sentido sobre una ecografía.
 *
 * 🔴 Lo que se marca ahí es "esta **ecografía** se puede pedir en el control
 * ginecológico integral". Ofrecerlo en cualquier tipo dejaba a un admin marcar
 * "Consulta clínica" como pedible en el control: una opción que no significa
 * nada y que el backend rechaza. Y si el tipo deja de ser ecografía, lo que
 * viaja tiene que decir lo mismo que la pantalla.
 */
describe("ConsultationTypeDialog — el flag del control es de las ecografías", () => {
  beforeEach(() => {
    createType.mockReset().mockResolvedValue(buildType());
    updateType.mockReset().mockResolvedValue(buildType());
  });

  const integralSwitchSiEsta = () =>
    screen.queryByRole("switch", { name: /control ginecológico integral/i });

  it("un tipo que no es ecografía no ofrece el switch del control", () => {
    render(
      <ConsultationTypeDialog open onOpenChange={vi.fn()} consultationType={null} />,
    );

    expect(ecoSwitch()).not.toBeChecked();
    expect(integralSwitchSiEsta()).not.toBeInTheDocument();
  });

  it("al marcarlo como subtipo de ecografía, el switch aparece", () => {
    render(
      <ConsultationTypeDialog open onOpenChange={vi.fn()} consultationType={null} />,
    );

    fireEvent.click(ecoSwitch());

    expect(integralSwitchSiEsta()).toBeInTheDocument();
  });

  it("si deja de ser ecografía, el switch se va y no viaja marcado", async () => {
    render(
      <ConsultationTypeDialog
        open
        onOpenChange={vi.fn()}
        consultationType={buildType({
          isEcoSubtype: true,
          isIntegralCheckupEco: true,
        })}
      />,
    );

    fireEvent.click(ecoSwitch());
    expect(integralSwitchSiEsta()).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /guardar cambios/i }));

    await waitFor(() => expect(updateType).toHaveBeenCalled());
    expect(updateType).toHaveBeenCalledWith({
      id: 41,
      dto: expect.objectContaining({
        isEcoSubtype: false,
        isIntegralCheckupEco: false,
      }),
    });
  });

  it("un tipo viejo mal marcado no se guarda pedible en el control", async () => {
    // Datos de antes de la validación: no es ecografía pero quedó marcado.
    // La pantalla no lo ofrece, así que lo que viaja tampoco lo dice.
    render(
      <ConsultationTypeDialog
        open
        onOpenChange={vi.fn()}
        consultationType={buildType({
          isEcoSubtype: false,
          isIntegralCheckupEco: true,
        })}
      />,
    );

    expect(integralSwitchSiEsta()).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /guardar cambios/i }));

    await waitFor(() => expect(updateType).toHaveBeenCalled());
    expect(updateType).toHaveBeenCalledWith({
      id: 41,
      dto: expect.objectContaining({ isIntegralCheckupEco: false }),
    });
  });
});

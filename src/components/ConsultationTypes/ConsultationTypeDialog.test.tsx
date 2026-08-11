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
  createdAt: "2026-08-11T10:00:00Z",
  updatedAt: "2026-08-11T10:00:00Z",
  ...overrides,
});

const ecoSwitch = () => screen.getByRole("switch", { name: /subtipo de ecografía/i });

describe("ConsultationTypeDialog — flag de subtipo de eco", () => {
  beforeEach(() => {
    createType.mockReset().mockResolvedValue(buildType());
    updateType.mockReset().mockResolvedValue(buildType());
  });

  it("crea el tipo marcado como subtipo de eco sin tocar ninguna env", async () => {
    render(
      <ConsultationTypeDialog open onOpenChange={vi.fn()} consultationType={null} />,
    );

    fireEvent.change(screen.getByLabelText(/nombre/i), {
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

    fireEvent.change(screen.getByLabelText(/nombre/i), {
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

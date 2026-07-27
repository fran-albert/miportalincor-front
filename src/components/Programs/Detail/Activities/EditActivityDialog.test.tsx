// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import EditActivityDialog from "./EditActivityDialog";
import {
  ProgramActivity,
  ProgramTariffType,
} from "@/types/Program/ProgramActivity";

const mockUpdate = vi.fn();
const mockShowError = vi.fn();

vi.mock("@/hooks/Program/useActivityMutations", () => ({
  useActivityMutations: () => ({
    updateActivityMutation: {
      mutateAsync: mockUpdate,
      isPending: false,
    },
  }),
}));

vi.mock("@/hooks/Toast/toast-context", () => ({
  useToastContext: () => ({
    promiseToast: <T,>(promise: Promise<T>) => promise,
    showError: mockShowError,
  }),
}));

const activity: ProgramActivity = {
  id: "activity-1",
  programId: "program-1",
  name: "Gimnasio",
  description: "Actividad mensual",
  assignedProfessionalUserId: null,
  qrToken: "qr-token",
  isActive: true,
  tariffType: ProgramTariffType.MONTHLY_FIXED,
  unitPriceCents: "3500000",
};

describe("EditActivityDialog", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("guarda una actividad sin profesional asignado", async () => {
    mockUpdate.mockResolvedValue(undefined);
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <EditActivityDialog
        programId="program-1"
        activity={activity}
        onClose={onClose}
      />
    );

    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() =>
      expect(mockUpdate).toHaveBeenCalledWith({
        activityId: "activity-1",
        dto: {
          name: "Gimnasio",
          description: "Actividad mensual",
          assignedProfessionalUserId: undefined,
          tariffType: ProgramTariffType.MONTHLY_FIXED,
          unitPriceCents: "3500000",
        },
      })
    );
    expect(onClose).toHaveBeenCalledOnce();
    expect(mockShowError).not.toHaveBeenCalled();
  });

  it("avisa cuando la validación impide guardar", async () => {
    const user = userEvent.setup();

    render(
      <EditActivityDialog
        programId="program-1"
        activity={{ ...activity, unitPriceCents: undefined }}
        onClose={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() =>
      expect(mockShowError).toHaveBeenCalledWith(
        "Revisá los campos marcados"
      )
    );
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

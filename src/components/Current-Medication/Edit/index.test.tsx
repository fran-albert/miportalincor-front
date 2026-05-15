import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import EditCurrentMedicationModal from ".";
import { MedicationStatus } from "@/types/Current-Medication/Current-Medication";
import type { MedicacionActual } from "@/types/Antecedentes/Antecedentes";

vi.mock("@/hooks/Current-Medication/useCurrentMedication", () => ({
  useUpdateCurrentMedication: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useSuspendCurrentMedication: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock("@/hooks/Toast/toast-context", () => ({
  useToastContext: () => ({
    promiseToast: (promise: Promise<unknown>) => promise,
    showError: vi.fn(),
  }),
}));

const buildMedication = (observations: string): MedicacionActual => ({
  id: 1,
  createdAt: "2026-05-15T10:00:00.000Z",
  updatedAt: "2026-05-15T10:00:00.000Z",
  deletedAt: "",
  idUserHistoriaClinica: "hc-1",
  idDoctor: "doctor-1",
  startDate: "2026-05-15",
  status: MedicationStatus.ACTIVE,
  observations,
});

describe("EditCurrentMedicationModal", () => {
  it("usa la observacion vigente al abrir y no pisa el draft con refetchs mientras se edita", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    const { rerender } = render(
      <EditCurrentMedicationModal
        isOpen={false}
        onClose={onClose}
        medication={buildMedication("Texto anterior")}
        userType="doctor"
      />
    );

    rerender(
      <EditCurrentMedicationModal
        isOpen={true}
        onClose={onClose}
        medication={buildMedication("Texto guardado")}
        userType="doctor"
      />
    );

    const textarea = await screen.findByLabelText(/Observaciones de Medicación/i);
    await waitFor(() => expect(textarea).toHaveValue("Texto guardado"));

    await user.clear(textarea);
    await user.type(textarea, "Borrador en curso");

    rerender(
      <EditCurrentMedicationModal
        isOpen={true}
        onClose={onClose}
        medication={buildMedication("Texto de refetch")}
        userType="doctor"
      />
    );

    expect(textarea).toHaveValue("Borrador en curso");

    rerender(
      <EditCurrentMedicationModal
        isOpen={false}
        onClose={onClose}
        medication={buildMedication("Texto final")}
        userType="doctor"
      />
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    rerender(
      <EditCurrentMedicationModal
        isOpen={true}
        onClose={onClose}
        medication={buildMedication("Texto final")}
        userType="doctor"
      />
    );

    const reopenedTextarea = await screen.findByLabelText(
      /Observaciones de Medicación/i
    );
    await waitFor(() => expect(reopenedTextarea).toHaveValue("Texto final"));
  });
});

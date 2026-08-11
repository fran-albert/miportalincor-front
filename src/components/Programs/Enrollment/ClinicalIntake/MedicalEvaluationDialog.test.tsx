// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ProgramActivity,
  ProgramTariffType,
} from "@/types/Program/ProgramActivity";
import { FrequencyPeriod, ScheduleType } from "@/types/Program/ProgramPlan";
import { TherapeuticExerciseType } from "@/types/Program/ProgramClinicalIntake";
import MedicalEvaluationDialog from "./MedicalEvaluationDialog";

const createEvaluation = vi.fn();

vi.mock("@/hooks/Program/useClinicalIntakeMutations", () => ({
  useClinicalIntakeMutations: () => ({
    createEvaluationMutation: {
      mutateAsync: createEvaluation,
      isPending: false,
    },
    updateEvaluationMutation: { mutateAsync: vi.fn(), isPending: false },
    createMeasurementMutation: { mutateAsync: vi.fn(), isPending: false },
  }),
}));

vi.mock("@/hooks/Program/useCurrentPlan", () => ({
  useCurrentPlan: () => ({ currentPlan: undefined, isLoading: false }),
}));

vi.mock("@/hooks/Toast/toast-context", () => ({
  useToastContext: () => ({
    promiseToast: (promise: Promise<unknown>) => promise,
  }),
}));

const activities: ProgramActivity[] = [
  {
    id: "gym",
    programId: "program-dolor",
    name: "Gimnasio",
    qrToken: "qr-gym",
    isActive: true,
    tariffType: ProgramTariffType.MONTHLY_FIXED,
    unitPriceCents: "3500000",
    discountEligible: false,
  },
];

const renderDialog = () =>
  render(
    <MedicalEvaluationDialog
      enrollmentId="enrollment-1"
      activities={activities}
      evaluation={null}
      isOpen
      setIsOpen={vi.fn()}
    />
  );

beforeEach(() => createEvaluation.mockReset());
afterEach(cleanup);

describe("MedicalEvaluationDialog", () => {
  it("no guarda sin diagnóstico", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Guardar ficha" }));

    expect(screen.getByText("El diagnóstico es obligatorio.")).toBeInTheDocument();
    expect(createEvaluation).not.toHaveBeenCalled();
  });

  it("no guarda sin el nivel de dolor: es el campo que el papel dejó vacío", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.type(screen.getByLabelText("Diagnóstico *"), "Gonartrosis");
    await user.click(screen.getByRole("button", { name: "Guardar ficha" }));

    expect(
      screen.getByText(
        "El nivel de dolor inicial es obligatorio: es el dato que arma la curva."
      )
    ).toBeInTheDocument();
    expect(createEvaluation).not.toHaveBeenCalled();
  });

  it("no guarda sin derivación con frecuencia", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.type(screen.getByLabelText("Diagnóstico *"), "Gonartrosis");
    await user.click(screen.getByRole("button", { name: "8" }));
    await user.click(screen.getByRole("button", { name: "Guardar ficha" }));

    expect(
      screen.getByText(
        "Marcá al menos una actividad de derivación con su frecuencia semanal."
      )
    ).toBeInTheDocument();
    expect(createEvaluation).not.toHaveBeenCalled();
  });

  it("manda la ficha completa con la derivación por actividad elegida", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.type(
      screen.getByLabelText("Diagnóstico *"),
      "Gonartrosis bilateral"
    );
    await user.click(screen.getByRole("button", { name: "8" }));
    await user.type(
      screen.getByLabelText("Zonas a evitar o movimientos contraindicados"),
      "Evitar impacto"
    );
    await user.click(screen.getByRole("checkbox", { name: /Gimnasio/ }));
    await user.click(
      screen.getByRole("checkbox", { name: "Movilidad y elongación" })
    );
    await user.type(
      screen.getByLabelText("Observaciones para el profesional"),
      "Genu varo y cuadriceps"
    );

    await user.click(screen.getByRole("button", { name: "Guardar ficha" }));

    await waitFor(() => expect(createEvaluation).toHaveBeenCalledTimes(1));
    const payload = createEvaluation.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.diagnosis).toBe("Gonartrosis bilateral");
    expect(payload.initialScore).toBe(8);
    expect(payload.contraindications).toBe("Evitar impacto");
    expect(payload.referral).toEqual({
      validFrom: expect.any(String),
      activities: [
        {
          activityId: "gym",
          scheduleType: ScheduleType.FREQUENCY,
          frequencyCount: 2,
          frequencyPeriod: FrequencyPeriod.WEEKLY,
          exerciseTypes: [TherapeuticExerciseType.MOBILITY_AND_STRETCHING],
          notes: "Genu varo y cuadriceps",
        },
      ],
    });
  });

  it("no manda los opcionales vacíos como cadena vacía", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.type(screen.getByLabelText("Diagnóstico *"), "Lumbalgia");
    await user.click(screen.getByRole("button", { name: "5" }));
    await user.click(screen.getByRole("checkbox", { name: /Gimnasio/ }));
    await user.click(screen.getByRole("button", { name: "Guardar ficha" }));

    await waitFor(() => expect(createEvaluation).toHaveBeenCalledTimes(1));
    const payload = createEvaluation.mock.calls[0][0] as Record<string, unknown>;
    expect(payload).not.toHaveProperty("contraindications");
    expect(payload).not.toHaveProperty("pharmacologicalTreatment");
    expect(payload).not.toHaveProperty("nextControlSchedule");
  });
});

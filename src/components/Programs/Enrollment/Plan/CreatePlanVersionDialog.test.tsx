// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getArgentinaTodayDate } from "@/common/helpers/argentinaDate";
import { ProgramActivity, ProgramTariffType } from "@/types/Program/ProgramActivity";
import CreatePlanVersionDialog from "./CreatePlanVersionDialog";

vi.mock("@/hooks/Program/usePlanMutations", () => ({
  usePlanMutations: () => ({
    createPlanVersionMutation: { mutateAsync: vi.fn(), isPending: false },
  }),
}));

vi.mock("@/hooks/Program/useCurrentPlan", () => ({
  useCurrentPlan: () => ({ currentPlan: undefined, isLoading: false }),
}));

vi.mock("@/hooks/Toast/toast-context", () => ({
  useToastContext: () => ({ promiseToast: vi.fn() }),
}));

const activities: ProgramActivity[] = [
  {
    id: "nutrition",
    programId: "program-1",
    name: "Nutrición",
    qrToken: "qr-nutrition",
    isActive: true,
    tariffType: ProgramTariffType.PER_SESSION,
    unitPriceCents: "3000000",
    discountEligible: true,
  },
];

const renderDialog = () =>
  render(
    <CreatePlanVersionDialog
      enrollmentId="enrollment-1"
      activities={activities}
      isOpen
      setIsOpen={vi.fn()}
    />
  );

afterEach(cleanup);

describe("CreatePlanVersionDialog", () => {
  it("no advierte nada cuando el plan empieza hoy", () => {
    renderDialog();

    expect(screen.getByLabelText("Válido desde")).toHaveValue(
      getArgentinaTodayDate()
    );
    expect(
      screen.queryByText("Este plan empieza en el futuro")
    ).toBeNull();
  });

  it("advierte que el paciente queda sin plan vigente hasta la fecha futura", async () => {
    const user = userEvent.setup();
    renderDialog();

    const validFrom = screen.getByLabelText("Válido desde");
    await user.clear(validFrom);
    await user.type(validFrom, "2099-09-01");

    expect(
      screen.getByText("Este plan empieza en el futuro")
    ).toBeInTheDocument();
    expect(screen.getByText(/01\/09\/2099/)).toBeInTheDocument();
  });
});

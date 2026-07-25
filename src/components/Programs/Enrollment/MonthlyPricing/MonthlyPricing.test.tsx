// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProgramTariffType } from "@/types/Program/ProgramActivity";
import {
  ProgramMonthlyPlan,
  ProgramMonthlyWhatsappStatus,
} from "@/types/Program/ProgramMonthlyPlan";
import MonthlyPlanEditor from "./MonthlyPlanEditor";
import MonthlyPlanHistory from "./MonthlyPlanHistory";

const realCasePlan = (): ProgramMonthlyPlan => ({
  id: "monthly-plan-1",
  persisted: true,
  enrollmentId: "enrollment-1",
  periodYear: 2026,
  periodMonth: 7,
  programMonthNumber: 1,
  programName: "Programa de obesidad",
  discountBasisPoints: 1000,
  discountPercent: 10,
  listTotalCents: "12500000",
  discountAmountCents: "1250000",
  discountedTotalCents: "11250000",
  revision: 1,
  whatsappStatus: ProgramMonthlyWhatsappStatus.DISABLED,
  createdAt: "2026-07-25T12:00:00.000Z",
  updatedAt: "2026-07-25T12:00:00.000Z",
  activities: [
    {
      id: "item-1",
      activityId: "nutrition",
      activityName: "Nutrición",
      tariffType: ProgramTariffType.PER_SESSION,
      unitPriceCents: "3000000",
      quantity: 3,
      listSubtotalCents: "9000000",
      discountBasisPoints: 1000,
      discountAmountCents: "900000",
      discountedSubtotalCents: "8100000",
      pricingConfigured: true,
    },
    {
      id: "item-2",
      activityId: "psychology",
      activityName: "Psicología",
      tariffType: ProgramTariffType.PER_SESSION,
      unitPriceCents: "2500000",
      quantity: 0,
      listSubtotalCents: "0",
      discountBasisPoints: 1000,
      discountAmountCents: "0",
      discountedSubtotalCents: "0",
      pricingConfigured: true,
    },
    {
      id: "item-3",
      activityId: "gym",
      activityName: "Gimnasio",
      tariffType: ProgramTariffType.MONTHLY_FIXED,
      unitPriceCents: "3500000",
      quantity: 4,
      listSubtotalCents: "3500000",
      discountBasisPoints: 1000,
      discountAmountCents: "350000",
      discountedSubtotalCents: "3150000",
      pricingConfigured: true,
    },
  ],
});

afterEach(cleanup);

describe("MonthlyPlanEditor", () => {
  it("muestra el caso real y no multiplica el arancel mensual fijo", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(
      <MonthlyPlanEditor plan={realCasePlan()} isSaving={false} onSave={onSave} />
    );

    expect(screen.getByText("$ 112.500")).toBeInTheDocument();
    expect(screen.getByText("$ 81.000")).toBeInTheDocument();
    expect(screen.getByText("$ 31.500")).toBeInTheDocument();
    expect(screen.getAllByText("$ 0").length).toBeGreaterThan(0);

    await user.clear(screen.getByLabelText("Cantidad de Gimnasio"));
    await user.type(screen.getByLabelText("Cantidad de Gimnasio"), "9");
    expect(screen.getByText("$ 112.500")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Guardar plan del mes" }));
    expect(onSave).toHaveBeenCalledWith({
      activities: [
        { activityId: "nutrition", quantity: 3 },
        { activityId: "psychology", quantity: 0 },
        { activityId: "gym", quantity: 9 },
      ],
    });
  });
});

describe("MonthlyPlanHistory", () => {
  it("muestra todos los estados y ofrece retry sólo cuando corresponde", async () => {
    const statuses = Object.values(ProgramMonthlyWhatsappStatus);
    const plans = statuses.map((status, index) => ({
      ...realCasePlan(),
      id: `plan-${status}`,
      periodMonth: index + 1,
      whatsappStatus: status,
    }));
    const onRetry = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(
      <MonthlyPlanHistory
        plans={plans}
        isLoading={false}
        onRetry={onRetry}
      />
    );

    expect(screen.getByText("Enviado")).toBeInTheDocument();
    expect(screen.getByText("Pendiente")).toBeInTheDocument();
    expect(screen.getByText("Falló")).toBeInTheDocument();
    expect(screen.getByText("Sin teléfono")).toBeInTheDocument();
    expect(screen.getByText("Desactivado")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /abril de 2026/i }));
    await user.click(screen.getByRole("button", { name: "Reintentar aviso" }));
    expect(onRetry).toHaveBeenCalledWith(
      expect.objectContaining({
        whatsappStatus: ProgramMonthlyWhatsappStatus.FAILED,
      })
    );

    await user.click(screen.getByRole("button", { name: /marzo de 2026/i }));
    expect(screen.queryByRole("button", { name: "Reintentar aviso" })).toBeNull();
  });
});

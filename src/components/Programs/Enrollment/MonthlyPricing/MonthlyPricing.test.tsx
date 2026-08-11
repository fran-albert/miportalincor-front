// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProgramTariffType } from "@/types/Program/ProgramActivity";
import {
  ProgramMonthlyPlan,
  ProgramMonthlyWhatsappStatus,
  ProgramPlanPeriodStatus,
  ProgramQuantitySource,
} from "@/types/Program/ProgramMonthlyPlan";
import MonthlyPlanEditor from "./MonthlyPlanEditor";
import MonthlyPlanHistory from "./MonthlyPlanHistory";
import SendWhatsappDialog from "./SendWhatsappDialog";

const realCasePlan = (): ProgramMonthlyPlan => ({
  id: "monthly-plan-1",
  persisted: true,
  enrollmentId: "enrollment-1",
  periodYear: 2026,
  periodMonth: 7,
  programMonthNumber: 1,
  programName: "Programa de obesidad",
  hasHealthInsurance: false,
  discountBasisPoints: 1000,
  discountPercent: 10,
  listTotalCents: "12500000",
  discountAmountCents: "900000",
  discountedTotalCents: "11600000",
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
      coveredQuantity: 0,
      coverageAvailable: false,
      coverageQuotaExceeded: false,
      listSubtotalCents: "9000000",
      discountEligible: true,
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
      coveredQuantity: 0,
      coverageAvailable: false,
      coverageQuotaExceeded: false,
      listSubtotalCents: "0",
      discountEligible: true,
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
      coveredQuantity: 0,
      coverageAvailable: false,
      coverageQuotaExceeded: false,
      listSubtotalCents: "3500000",
      discountEligible: false,
      discountBasisPoints: 0,
      discountAmountCents: "0",
      discountedSubtotalCents: "3500000",
      pricingConfigured: true,
    },
  ],
});

const coveragePlan = (psicologiaQuantity: number): ProgramMonthlyPlan => ({
  id: "monthly-plan-coverage",
  persisted: false,
  enrollmentId: "enrollment-1",
  periodYear: 2026,
  periodMonth: 8,
  programMonthNumber: 8,
  programName: "Programa de obesidad",
  healthInsuranceId: 1,
  healthInsuranceName: "IAPOS",
  hasHealthInsurance: true,
  discountBasisPoints: 1000,
  discountPercent: 10,
  listTotalCents: "0",
  discountAmountCents: "0",
  discountedTotalCents: "0",
  revision: 0,
  whatsappStatus: ProgramMonthlyWhatsappStatus.DISABLED,
  activities: [
    {
      activityId: "nutrition",
      activityName: "Nutrición",
      tariffType: ProgramTariffType.PER_SESSION,
      unitPriceCents: "3000000",
      quantity: 4,
      coveredQuantity: 2,
      coveredUnitPriceCents: "1500000",
      coverageAvailable: true,
      coveredSessionsPerMonth: 2,
      coverageQuotaExceeded: false,
      listSubtotalCents: "0",
      discountEligible: true,
      discountBasisPoints: 1000,
      discountAmountCents: "0",
      discountedSubtotalCents: "0",
      pricingConfigured: true,
    },
    {
      activityId: "psychology",
      activityName: "Psicología",
      tariffType: ProgramTariffType.PER_SESSION,
      unitPriceCents: "3500000",
      quantity: psicologiaQuantity,
      coveredQuantity: 0,
      coverageAvailable: false,
      coverageQuotaExceeded: false,
      listSubtotalCents: "0",
      discountEligible: true,
      discountBasisPoints: 1000,
      discountAmountCents: "0",
      discountedSubtotalCents: "0",
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

    expect(screen.getByText("$ 116.000")).toBeInTheDocument();
    expect(screen.getByText("$ 81.000")).toBeInTheDocument();
    expect(screen.getAllByText("$ 35.000").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$ 0").length).toBeGreaterThan(0);

    // El fijo no se edita como si fuera por sesión: solo se cobra o no.
    expect(screen.queryByLabelText("Cantidad de Gimnasio")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Guardar plan del mes" }));
    expect(onSave).toHaveBeenCalledWith({
      activities: [
        { activityId: "nutrition", quantity: 3, discountEligible: true },
        { activityId: "psychology", quantity: 0, discountEligible: true },
        { activityId: "gym", quantity: 4, discountEligible: false },
      ],
    });
  });

  it("el arancel mensual fijo se cobra o no se cobra, sin cantidad por sesión", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(
      <MonthlyPlanEditor plan={realCasePlan()} isSaving={false} onSave={onSave} />
    );

    const gymCheckbox = screen.getByLabelText("Cobrar Gimnasio este mes");
    expect(gymCheckbox).toBeChecked();

    await user.click(gymCheckbox);
    expect(screen.getAllByText("$ 81.000").length).toBeGreaterThan(1);

    await user.click(gymCheckbox);
    expect(screen.getByText("$ 116.000")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Guardar plan del mes" }));
    expect(onSave).toHaveBeenCalledWith({
      activities: [
        { activityId: "nutrition", quantity: 3, discountEligible: true },
        { activityId: "psychology", quantity: 0, discountEligible: true },
        { activityId: "gym", quantity: 1, discountEligible: false },
      ],
    });
  });

  it("el descuento se decide por línea y se puede cambiar antes de guardar", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(
      <MonthlyPlanEditor plan={realCasePlan()} isSaving={false} onSave={onSave} />
    );

    // El gimnasio llega sin descuento por rubro, aunque el programa tenga 10%.
    expect(
      screen.getByLabelText("Aplicar el descuento a Gimnasio")
    ).not.toBeChecked();
    const nutricion = screen.getByLabelText("Aplicar el descuento a Nutrición");
    expect(nutricion).toBeChecked();

    // Sacarle el descuento a nutrición sube el total del mes: 81.000 -> 90.000.
    await user.click(nutricion);
    expect(screen.getAllByText("$ 125.000").length).toBeGreaterThan(0);

    await user.click(
      screen.getByRole("button", { name: "Guardar plan del mes" })
    );
    expect(onSave).toHaveBeenCalledWith({
      activities: [
        { activityId: "nutrition", quantity: 3, discountEligible: false },
        { activityId: "psychology", quantity: 0, discountEligible: true },
        { activityId: "gym", quantity: 4, discountEligible: false },
      ],
    });
  });

  it("ofrece enviar el aviso cuando el plan quedó sin enviar y no lo dispara al guardar", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onSendWhatsapp = vi.fn();
    const user = userEvent.setup();

    render(
      <MonthlyPlanEditor
        plan={{
          ...realCasePlan(),
          whatsappStatus: ProgramMonthlyWhatsappStatus.NOT_REQUESTED,
        }}
        isSaving={false}
        onSave={onSave}
        onSendWhatsapp={onSendWhatsapp}
      />
    );

    expect(screen.getByText("Sin enviar")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Guardar plan del mes" }));
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSendWhatsapp).not.toHaveBeenCalled();

    await user.click(
      screen.getByRole("button", { name: "Enviar aviso al paciente" })
    );
    expect(onSendWhatsapp).toHaveBeenCalledTimes(1);
  });

  it("no ofrece el envío cuando el aviso ya salió", () => {
    render(
      <MonthlyPlanEditor
        plan={{
          ...realCasePlan(),
          whatsappStatus: ProgramMonthlyWhatsappStatus.SENT,
        }}
        isSaving={false}
        onSave={vi.fn()}
        onSendWhatsapp={vi.fn()}
      />
    );

    expect(
      screen.queryByRole("button", { name: "Enviar aviso al paciente" })
    ).toBeNull();
  });
});

describe("MonthlyPlanEditor con cobertura de obra social", () => {
  it("reproduce el presupuesto de agosto de Paolini: $ 207.000", () => {
    render(
      <MonthlyPlanEditor
        plan={coveragePlan(4)}
        isSaving={false}
        onSave={vi.fn()}
      />
    );

    expect(screen.getByText("Obra social: IAPOS")).toBeInTheDocument();
    expect(screen.getByText("Cupo 2/mes")).toBeInTheDocument();
    expect(screen.getByText("$ 81.000")).toBeInTheDocument();
    expect(screen.getByText("$ 126.000")).toBeInTheDocument();
    expect(screen.getByText("$ 207.000")).toBeInTheDocument();
    expect(
      screen.getByText(/2 con obra social × \$ 15\.000 \+ 2 particulares × \$ 30\.000/)
    ).toBeInTheDocument();
  });

  it("reproduce el presupuesto de agosto de Mancinelli: $ 144.000", () => {
    render(
      <MonthlyPlanEditor
        plan={coveragePlan(2)}
        isSaving={false}
        onSave={vi.fn()}
      />
    );

    expect(screen.getByText("$ 81.000")).toBeInTheDocument();
    expect(screen.getByText("$ 63.000")).toBeInTheDocument();
    expect(screen.getByText("$ 144.000")).toBeInTheDocument();
  });

  it("manda las sesiones con obra social al guardar y advierte si superan el cupo", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(
      <MonthlyPlanEditor
        plan={coveragePlan(0)}
        isSaving={false}
        onSave={onSave}
      />
    );

    const coveredInput = screen.getByLabelText(
      "Sesiones con obra social de Nutrición"
    );
    await user.clear(coveredInput);
    await user.type(coveredInput, "3");
    expect(screen.getByText("Supera el cupo")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Guardar plan del mes" })
    );
    expect(onSave).toHaveBeenCalledWith({
      activities: [
        {
          activityId: "nutrition",
          quantity: 4,
          coveredQuantity: 3,
          discountEligible: true,
        },
        { activityId: "psychology", quantity: 0, discountEligible: true },
      ],
    });
  });

  it("bloquea el guardado si las cubiertas superan las sesiones del mes", async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();

    render(
      <MonthlyPlanEditor
        plan={coveragePlan(0)}
        isSaving={false}
        onSave={onSave}
      />
    );

    const coveredInput = screen.getByLabelText(
      "Sesiones con obra social de Nutrición"
    );
    await user.clear(coveredInput);
    await user.type(coveredInput, "5");

    expect(
      screen.getByText("Revisá las sesiones con obra social")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Guardar plan del mes" })
    ).toBeDisabled();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("avisa cuando el paciente no tiene obra social cargada", () => {
    render(
      <MonthlyPlanEditor
        plan={realCasePlan()}
        isSaving={false}
        onSave={vi.fn()}
      />
    );

    expect(
      screen.getByText("El paciente no tiene obra social cargada")
    ).toBeInTheDocument();
  });
});

const preloadedPlan = (): ProgramMonthlyPlan => ({
  persisted: false,
  enrollmentId: "enrollment-1",
  periodYear: 2026,
  periodMonth: 8,
  programMonthNumber: 8,
  programName: "Programa de obesidad",
  hasHealthInsurance: false,
  discountBasisPoints: 1000,
  discountPercent: 10,
  listTotalCents: "22500000",
  discountAmountCents: "1900000",
  discountedTotalCents: "20600000",
  revision: 0,
  whatsappStatus: ProgramMonthlyWhatsappStatus.DISABLED,
  planStatus: ProgramPlanPeriodStatus.ACTIVE,
  planStatusMessage:
    "Cantidades sugeridas a partir de la versión 1 del plan del paciente.",
  planVersion: 1,
  planQuantitiesOutdated: false,
  activities: [
    {
      activityId: "nutrition",
      activityName: "Nutrición",
      tariffType: ProgramTariffType.PER_SESSION,
      unitPriceCents: "3000000",
      quantity: 4,
      coveredQuantity: 0,
      coverageAvailable: false,
      coverageQuotaExceeded: false,
      listSubtotalCents: "12000000",
      discountEligible: true,
      discountBasisPoints: 1000,
      discountAmountCents: "1200000",
      discountedSubtotalCents: "10800000",
      pricingConfigured: true,
      quantitySource: ProgramQuantitySource.PLAN,
      planSuggestedQuantity: 4,
    },
    {
      activityId: "kinesiology",
      activityName: "Kinesiología",
      tariffType: ProgramTariffType.PER_SESSION,
      unitPriceCents: "1000000",
      quantity: 0,
      coveredQuantity: 0,
      coverageAvailable: false,
      coverageQuotaExceeded: false,
      listSubtotalCents: "0",
      discountEligible: true,
      discountBasisPoints: 1000,
      discountAmountCents: "0",
      discountedSubtotalCents: "0",
      pricingConfigured: true,
      quantitySource: ProgramQuantitySource.NONE,
      planSuggestedQuantity: 0,
    },
  ],
});

const outdatedPlan = (
  whatsappStatus = ProgramMonthlyWhatsappStatus.NOT_REQUESTED
): ProgramMonthlyPlan => ({
  ...preloadedPlan(),
  id: "monthly-plan-outdated",
  persisted: true,
  revision: 1,
  whatsappStatus,
  planVersion: 2,
  sourcePlanVersion: 1,
  planQuantitiesOutdated: true,
  activities: preloadedPlan().activities.map((activity) =>
    activity.activityId === "nutrition"
      ? { ...activity, quantity: 3, planSuggestedQuantity: 8 }
      : activity
  ),
});

describe("MonthlyPlanEditor con precarga desde el plan", () => {
  it("abre el mes nuevo con las cantidades del plan y avisa que son sugeridas", () => {
    render(
      <MonthlyPlanEditor
        plan={preloadedPlan()}
        isSaving={false}
        onSave={vi.fn()}
      />
    );

    expect(
      screen.getByText("Cantidades sugeridas a partir del plan del paciente")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Cantidad de Nutrición")).toHaveValue("4");
    expect(screen.getByLabelText("Cantidad de Kinesiología")).toHaveValue("0");
    expect(screen.getAllByText("$ 108.000").length).toBeGreaterThan(0);
  });

  it("dice por qué las cantidades vienen en cero cuando el plan no cubre el mes", () => {
    render(
      <MonthlyPlanEditor
        plan={{
          ...preloadedPlan(),
          planStatus: ProgramPlanPeriodStatus.NOT_YET_VALID,
          planStatusMessage:
            "El plan del paciente empieza el 01/09/2026: para agosto de 2026 todavía no hay plan vigente.",
          planVersion: undefined,
          activities: preloadedPlan().activities.map((activity) => ({
            ...activity,
            quantity: 0,
            planSuggestedQuantity: undefined,
          })),
        }}
        isSaving={false}
        onSave={vi.fn()}
      />
    );

    expect(
      screen.getByText("El plan del paciente todavía no empezó")
    ).toBeInTheDocument();
    expect(screen.getByText(/01\/09\/2026/)).toBeInTheDocument();
    expect(
      screen.queryByText("Cantidades sugeridas a partir del plan del paciente")
    ).toBeNull();
  });

  it("no muestra el cartel de sugerencia en un mes ya guardado", () => {
    render(
      <MonthlyPlanEditor
        plan={{ ...preloadedPlan(), persisted: true, revision: 1 }}
        isSaving={false}
        onSave={vi.fn()}
      />
    );

    expect(
      screen.queryByText("Cantidades sugeridas a partir del plan del paciente")
    ).toBeNull();
  });
});

describe("MonthlyPlanEditor con desfasaje del plan", () => {
  it("compara lo guardado contra el plan sin pisar los valores", () => {
    render(
      <MonthlyPlanEditor
        plan={outdatedPlan()}
        isSaving={false}
        onSave={vi.fn()}
      />
    );

    expect(
      screen.getByText("El plan del paciente cambió después de guardar este mes")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Nutrición: 3 guardadas, 8 según el plan actual")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Cantidad de Nutrición")).toHaveValue("3");
  });

  it("actualizar desde el plan rellena el formulario y no guarda", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(
      <MonthlyPlanEditor plan={outdatedPlan()} isSaving={false} onSave={onSave} />
    );

    await user.click(
      screen.getByRole("button", { name: "Actualizar cantidades desde el plan" })
    );

    expect(screen.getByLabelText("Cantidad de Nutrición")).toHaveValue("8");
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getAllByText("$ 216.000").length).toBeGreaterThan(0);
  });

  it("advierte que al paciente ya se le informó otro total", () => {
    render(
      <MonthlyPlanEditor
        plan={outdatedPlan(ProgramMonthlyWhatsappStatus.SENT)}
        isSaving={false}
        onSave={vi.fn()}
      />
    );

    expect(
      screen.getByText(/ya se le informó el total de este mes/)
    ).toBeInTheDocument();
  });

  it("no muestra cartel en un mes guardado cuyo plan no cambió", () => {
    render(
      <MonthlyPlanEditor
        plan={{
          ...outdatedPlan(),
          planQuantitiesOutdated: false,
        }}
        isSaving={false}
        onSave={vi.fn()}
      />
    );

    expect(
      screen.queryByText(
        "El plan del paciente cambió después de guardar este mes"
      )
    ).toBeNull();
  });

  it("no muestra cartel en un mes viejo sin versión de origen", () => {
    render(
      <MonthlyPlanEditor
        plan={{
          ...preloadedPlan(),
          persisted: true,
          revision: 1,
          planStatus: undefined,
          planStatusMessage: undefined,
          sourcePlanVersion: undefined,
          planQuantitiesOutdated: undefined,
        }}
        isSaving={false}
        onSave={vi.fn()}
      />
    );

    expect(
      screen.queryByRole("button", {
        name: "Actualizar cantidades desde el plan",
      })
    ).toBeNull();
  });
});

describe("SendWhatsappDialog", () => {
  it("muestra paciente, mes y total antes de confirmar", async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const user = userEvent.setup();

    render(
      <SendWhatsappDialog
        plan={{
          ...realCasePlan(),
          whatsappStatus: ProgramMonthlyWhatsappStatus.NOT_REQUESTED,
        }}
        patientName="Ana Gómez"
        isSending={false}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(screen.getByText("Ana Gómez")).toBeInTheDocument();
    expect(screen.getByText("julio de 2026")).toBeInTheDocument();
    expect(screen.getByText("$ 116.000")).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Enviar aviso" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("no se muestra si no hay plan elegido", () => {
    render(
      <SendWhatsappDialog
        patientName="Ana Gómez"
        isSending={false}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(
      screen.queryByRole("button", { name: "Enviar aviso" })
    ).toBeNull();
  });
});

describe("MonthlyPlanHistory", () => {
  it("muestra todos los estados y ofrece el envío sólo cuando corresponde", async () => {
    const statuses = Object.values(ProgramMonthlyWhatsappStatus);
    const plans = statuses.map((status, index) => ({
      ...realCasePlan(),
      id: `plan-${status}`,
      periodMonth: index + 1,
      whatsappStatus: status,
    }));
    const onSendWhatsapp = vi.fn();
    const user = userEvent.setup();

    render(
      <MonthlyPlanHistory
        plans={plans}
        isLoading={false}
        onSendWhatsapp={onSendWhatsapp}
      />
    );

    expect(screen.getByText("Sin enviar")).toBeInTheDocument();
    expect(screen.getByText("Enviado")).toBeInTheDocument();
    expect(screen.getByText("Pendiente")).toBeInTheDocument();
    expect(screen.getByText("Falló")).toBeInTheDocument();
    expect(screen.getByText("Sin teléfono")).toBeInTheDocument();
    expect(screen.getByText("Desactivado")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /febrero de 2026/i }));
    await user.click(
      screen.getByRole("button", { name: "Enviar aviso al paciente" })
    );
    expect(onSendWhatsapp).toHaveBeenCalledWith(
      expect.objectContaining({
        whatsappStatus: ProgramMonthlyWhatsappStatus.NOT_REQUESTED,
      })
    );

    await user.click(screen.getByRole("button", { name: /mayo de 2026/i }));
    await user.click(screen.getByRole("button", { name: "Reintentar aviso" }));
    expect(onSendWhatsapp).toHaveBeenCalledWith(
      expect.objectContaining({
        whatsappStatus: ProgramMonthlyWhatsappStatus.FAILED,
      })
    );

    await user.click(screen.getByRole("button", { name: /abril de 2026/i }));
    expect(
      screen.queryByRole("button", { name: /aviso/i })
    ).toBeNull();
  });
});

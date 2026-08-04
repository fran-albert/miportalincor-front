import {
  ProgramMonthlyPlan,
  ProgramMonthlyPlanItem,
} from "@/types/Program/ProgramMonthlyPlan";
import { ProgramTariffType } from "@/types/Program/ProgramActivity";

const DECIMAL_CENTS_PATTERN = /^(0|[1-9]\d*)$/;
const PESOS_INPUT_PATTERN = /^(0|[1-9]\d*)(?:[.,](\d{1,2}))?$/;
const MAX_UNSIGNED_BIGINT = 18_446_744_073_709_551_615n;
const arsIntegerFormatter = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 0,
  useGrouping: true,
});

export const parseCents = (value: string, field = "importe"): bigint => {
  if (!DECIMAL_CENTS_PATTERN.test(value)) {
    throw new Error(`${field} debe ser una cadena decimal de centavos`);
  }

  const cents = BigInt(value);
  if (cents > MAX_UNSIGNED_BIGINT) {
    throw new Error(`${field} excede el máximo admitido`);
  }
  return cents;
};

export const isValidPesosInput = (value: string): boolean => {
  const match = PESOS_INPUT_PATTERN.exec(value.trim());
  if (!match) return false;

  const normalized = value.trim().replace(",", ".");
  const [whole, fraction = ""] = normalized.split(".");
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0") || "0") <=
    MAX_UNSIGNED_BIGINT;
};

export const pesosInputToCents = (value: string): string => {
  const trimmed = value.trim();
  if (!isValidPesosInput(trimmed)) {
    throw new Error("El precio debe ser un importe no negativo con hasta 2 decimales");
  }

  const [whole, fraction = ""] = trimmed.replace(",", ".").split(".");
  return (BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0") || "0")).toString();
};

export const centsToPesosInput = (value: string): string => {
  const cents = parseCents(value, "Precio");
  const whole = cents / 100n;
  const fraction = cents % 100n;
  return fraction === 0n
    ? whole.toString()
    : `${whole.toString()},${fraction.toString().padStart(2, "0")}`;
};

export const formatCentsToArs = (value: string): string => {
  const cents = parseCents(value);
  const whole = cents / 100n;
  const fraction = cents % 100n;
  const fractionLabel =
    fraction === 0n ? "" : `,${fraction.toString().padStart(2, "0")}`;
  return `$ ${arsIntegerFormatter.format(whole)}${fractionLabel}`;
};

export interface ProgramPricingCalculationInput {
  activityId?: string;
  activityName: string;
  tariffType: ProgramTariffType;
  unitPriceCents: string;
  quantity: number;
  coveredQuantity?: number;
  coveredUnitPriceCents?: string;
}

export interface ProgramPricingCalculatedItem
  extends ProgramPricingCalculationInput {
  coveredQuantity: number;
  privateQuantity: number;
  listSubtotalCents: string;
  discountBasisPoints: number;
  discountAmountCents: string;
  discountedSubtotalCents: string;
}

export interface ProgramPricingCalculation {
  items: ProgramPricingCalculatedItem[];
  listTotalCents: string;
  discountAmountCents: string;
  discountedTotalCents: string;
}

const resolveCoveredQuantity = (
  input: ProgramPricingCalculationInput
): number => {
  const coveredQuantity = input.coveredQuantity ?? 0;
  if (!Number.isInteger(coveredQuantity) || coveredQuantity < 0) {
    throw new Error(
      `Las sesiones con cobertura de ${input.activityName} no son válidas`
    );
  }
  if (coveredQuantity > input.quantity) {
    throw new Error(
      `Las sesiones con cobertura de ${input.activityName} no pueden superar las sesiones del mes`
    );
  }
  if (coveredQuantity === 0) return 0;
  if (input.tariffType !== ProgramTariffType.PER_SESSION) {
    throw new Error(
      `${input.activityName} se cobra como mensualidad fija y no admite cobertura por sesión`
    );
  }
  if (input.coveredUnitPriceCents === undefined) {
    throw new Error(
      `${input.activityName} no tiene un precio con cobertura configurado`
    );
  }
  return coveredQuantity;
};

export const calculateProgramPricing = (
  inputs: ProgramPricingCalculationInput[],
  discountBasisPoints: number
): ProgramPricingCalculation => {
  if (
    !Number.isInteger(discountBasisPoints) ||
    discountBasisPoints < 0 ||
    discountBasisPoints > 10_000
  ) {
    throw new Error("El descuento configurado no es válido");
  }

  const items = inputs.map((input): ProgramPricingCalculatedItem => {
    if (!Number.isInteger(input.quantity) || input.quantity < 0) {
      throw new Error(`La cantidad de ${input.activityName} no es válida`);
    }
    const unitPriceCents = parseCents(
      input.unitPriceCents,
      `Precio de ${input.activityName}`
    );
    const coveredQuantity = resolveCoveredQuantity(input);
    const privateQuantity = input.quantity - coveredQuantity;
    const coveredUnitPriceCents =
      input.coveredUnitPriceCents === undefined
        ? 0n
        : parseCents(
            input.coveredUnitPriceCents,
            `Precio con cobertura de ${input.activityName}`
          );
    const listSubtotalCents =
      input.tariffType === ProgramTariffType.PER_SESSION
        ? coveredUnitPriceCents * BigInt(coveredQuantity) +
          unitPriceCents * BigInt(privateQuantity)
        : input.quantity === 0
          ? 0n
          : unitPriceCents;
    if (listSubtotalCents > MAX_UNSIGNED_BIGINT) {
      throw new Error(`El subtotal de ${input.activityName} excede el máximo admitido`);
    }
    const effectiveDiscountBasisPoints =
      input.tariffType === ProgramTariffType.MONTHLY_FIXED
        ? 0
        : discountBasisPoints;
    const discountAmountCents =
      (listSubtotalCents * BigInt(effectiveDiscountBasisPoints) + 5_000n) /
      10_000n;

    return {
      ...input,
      coveredQuantity,
      privateQuantity,
      listSubtotalCents: listSubtotalCents.toString(),
      discountBasisPoints: effectiveDiscountBasisPoints,
      discountAmountCents: discountAmountCents.toString(),
      discountedSubtotalCents: (
        listSubtotalCents - discountAmountCents
      ).toString(),
    };
  });

  const listTotalCents = items.reduce(
    (total, item) => total + parseCents(item.listSubtotalCents),
    0n
  );
  const discountAmountCents = items.reduce(
    (total, item) => total + parseCents(item.discountAmountCents),
    0n
  );
  const discountedTotalCents = items.reduce(
    (total, item) => total + parseCents(item.discountedSubtotalCents),
    0n
  );
  if (
    listTotalCents > MAX_UNSIGNED_BIGINT ||
    discountAmountCents > MAX_UNSIGNED_BIGINT ||
    discountedTotalCents > MAX_UNSIGNED_BIGINT
  ) {
    throw new Error("El total del mes excede el máximo admitido");
  }

  return {
    items,
    listTotalCents: listTotalCents.toString(),
    discountAmountCents: discountAmountCents.toString(),
    discountedTotalCents: discountedTotalCents.toString(),
  };
};

const validateMonthlyPlanItemMoney = (
  item: ProgramMonthlyPlanItem
): void => {
  if (item.unitPriceCents !== undefined) {
    parseCents(item.unitPriceCents, `Precio de ${item.activityName}`);
  }
  if (item.coveredUnitPriceCents !== undefined) {
    parseCents(
      item.coveredUnitPriceCents,
      `Precio con cobertura de ${item.activityName}`
    );
  }
  parseCents(item.listSubtotalCents, `Subtotal de ${item.activityName}`);
  parseCents(item.discountAmountCents, `Descuento de ${item.activityName}`);
  parseCents(
    item.discountedSubtotalCents,
    `Subtotal con descuento de ${item.activityName}`
  );
};

export const validateProgramMonthlyPlanMoney = (
  plan: ProgramMonthlyPlan
): ProgramMonthlyPlan => {
  parseCents(plan.listTotalCents, "Total de lista");
  parseCents(plan.discountAmountCents, "Descuento total");
  parseCents(plan.discountedTotalCents, "Total con descuento");
  plan.activities.forEach(validateMonthlyPlanItemMoney);
  return plan;
};

export const validateOptionalActivityPrice = <T extends { unitPriceCents?: string }>(
  activity: T
): T => {
  if (activity.unitPriceCents !== undefined) {
    parseCents(activity.unitPriceCents, "Precio de actividad");
  }
  return activity;
};

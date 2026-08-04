import { describe, expect, it } from "vitest";
import { ProgramTariffType } from "@/types/Program/ProgramActivity";
import {
  calculateProgramPricing,
  centsToPesosInput,
  formatCentsToArs,
  parseCents,
  pesosInputToCents,
} from "./programMoney";

describe("programMoney", () => {
  it("valida centavos decimales sin convertirlos a Number", () => {
    expect(parseCents("18446744073709551615")).toBe(
      18_446_744_073_709_551_615n
    );
    expect(() => parseCents("10.50")).toThrow();
    expect(() => parseCents("-1")).toThrow();
    expect(() => parseCents("18446744073709551616")).toThrow();
  });

  it("convierte pesos y centavos de forma reversible y sin parseFloat", () => {
    expect(pesosInputToCents("30000")).toBe("3000000");
    expect(pesosInputToCents("125,50")).toBe("12550");
    expect(centsToPesosInput("12550")).toBe("125,50");
    expect(() => pesosInputToCents("30.000")).toThrow();
  });

  it("formatea ARS preservando enteros grandes", () => {
    expect(formatCentsToArs("11250000")).toBe("$ 112.500");
    expect(formatCentsToArs("12550")).toBe("$ 125,50");
  });

  it("replica el caso real con descuento por ítem", () => {
    const result = calculateProgramPricing(
      [
        {
          activityId: "nutricion",
          activityName: "Nutrición",
          tariffType: ProgramTariffType.PER_SESSION,
          unitPriceCents: "3000000",
          quantity: 3,
        },
        {
          activityId: "psicologia",
          activityName: "Psicología",
          tariffType: ProgramTariffType.PER_SESSION,
          unitPriceCents: "2500000",
          quantity: 0,
        },
        {
          activityId: "gimnasio",
          activityName: "Gimnasio",
          tariffType: ProgramTariffType.MONTHLY_FIXED,
          unitPriceCents: "3500000",
          quantity: 4,
        },
      ],
      1000
    );

    expect(result.items[0]).toMatchObject({
      listSubtotalCents: "9000000",
      discountAmountCents: "900000",
      discountedSubtotalCents: "8100000",
    });
    expect(result.items[1]).toMatchObject({
      listSubtotalCents: "0",
      discountedSubtotalCents: "0",
    });
    expect(result.items[2]).toMatchObject({
      listSubtotalCents: "3500000",
      discountAmountCents: "0",
      discountedSubtotalCents: "3500000",
    });
    expect(result.discountedTotalCents).toBe("11600000");
  });

  it("reproduce el presupuesto de agosto de Paolini: $207.000", () => {
    const result = calculateProgramPricing(
      [
        {
          activityId: "nutricion",
          activityName: "Nutrición",
          tariffType: ProgramTariffType.PER_SESSION,
          unitPriceCents: "3000000",
          quantity: 4,
          coveredQuantity: 2,
          coveredUnitPriceCents: "1500000",
        },
        {
          activityId: "psicologia",
          activityName: "Psicología",
          tariffType: ProgramTariffType.PER_SESSION,
          unitPriceCents: "3500000",
          quantity: 4,
        },
      ],
      1000
    );

    expect(result.items[0]).toMatchObject({
      coveredQuantity: 2,
      privateQuantity: 2,
      listSubtotalCents: "9000000",
      discountedSubtotalCents: "8100000",
    });
    expect(result.items[1].discountedSubtotalCents).toBe("12600000");
    expect(result.discountedTotalCents).toBe("20700000");
  });

  it("reproduce el presupuesto de agosto de Mancinelli: $144.000", () => {
    const result = calculateProgramPricing(
      [
        {
          activityId: "nutricion",
          activityName: "Nutrición",
          tariffType: ProgramTariffType.PER_SESSION,
          unitPriceCents: "3000000",
          quantity: 4,
          coveredQuantity: 2,
          coveredUnitPriceCents: "1500000",
        },
        {
          activityId: "psicologia",
          activityName: "Psicología",
          tariffType: ProgramTariffType.PER_SESSION,
          unitPriceCents: "3500000",
          quantity: 2,
        },
      ],
      1000
    );

    expect(result.discountedTotalCents).toBe("14400000");
  });

  it("rechaza más sesiones con cobertura que sesiones del mes", () => {
    expect(() =>
      calculateProgramPricing(
        [
          {
            activityId: "nutricion",
            activityName: "Nutrición",
            tariffType: ProgramTariffType.PER_SESSION,
            unitPriceCents: "3000000",
            quantity: 2,
            coveredQuantity: 3,
            coveredUnitPriceCents: "1500000",
          },
        ],
        1000
      )
    ).toThrow("no pueden superar las sesiones del mes");
  });

  it("redondea half-up a centavo igual que el backend", () => {
    const result = calculateProgramPricing(
      [
        {
          activityName: "Prueba",
          tariffType: ProgramTariffType.PER_SESSION,
          unitPriceCents: "1",
          quantity: 1,
        },
      ],
      5000
    );

    expect(result.items[0].discountAmountCents).toBe("1");
    expect(result.discountedTotalCents).toBe("0");
  });
});

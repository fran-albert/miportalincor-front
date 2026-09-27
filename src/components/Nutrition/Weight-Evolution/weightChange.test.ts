import { describe, expect, it } from "vitest";
import type { NutritionData } from "@/types/Nutrition-Data/NutritionData";
import { computeWeightChange, formatKg, formatSignedKg } from "./weightChange";

const record = (
  date: string | Date,
  weight: number,
  targetWeight = 0
): NutritionData => ({
  id: `${String(date)}-${weight}`,
  userId: "1515",
  date,
  weight,
  difference: 0,
  fatPercentage: 0,
  musclePercentage: 0,
  visceralFat: 0,
  imc: 0,
  height: 153,
  targetWeight,
  observations: "",
});

describe("computeWeightChange", () => {
  it("🔴 caso real: de 114,6 a 95,4 kg bajó 19,2 kg", () => {
    const result = computeWeightChange([
      record("2026-02-20T00:00:00.000Z", 114.6, 102),
      record("2026-05-20T00:00:00.000Z", 101.9, 101),
      record("2026-09-23T00:00:00.000Z", 95.4, 89.9),
    ]);

    expect(result).toEqual({
      firstWeight: 114.6,
      lastWeight: 95.4,
      firstDate: "2026-02-20",
      lastDate: "2026-09-23",
      change: -19.2,
      toTarget: 5.5,
    });
  });

  it("no depende del orden en que llegan los registros", () => {
    const result = computeWeightChange([
      record("2026-09-23", 95.4),
      record("2026-02-20", 114.6),
      record("2026-05-20", 101.9),
    ]);

    expect(result?.change).toBe(-19.2);
    expect(result?.firstDate).toBe("2026-02-20");
    expect(result?.lastDate).toBe("2026-09-23");
  });

  it("un aumento da diferencia positiva", () => {
    const result = computeWeightChange([
      record("2026-08-01", 80),
      record("2026-09-01", 81.3),
    ]);

    expect(result?.change).toBe(1.3);
  });

  it("sin cambio da 0 (no -0)", () => {
    const result = computeWeightChange([
      record("2026-08-01", 80),
      record("2026-09-01", 80),
    ]);

    expect(Object.is(result?.change, 0)).toBe(true);
  });

  it("acepta fechas como Date", () => {
    const result = computeWeightChange([
      record(new Date(2026, 1, 20), 114.6),
      record(new Date(2026, 8, 23), 95.4),
    ]);

    expect(result?.firstDate).toBe("2026-02-20");
    expect(result?.change).toBe(-19.2);
  });

  it("con 0 o 1 registros no hay nada que mostrar", () => {
    expect(computeWeightChange([])).toBeNull();
    expect(computeWeightChange([record("2026-09-01", 80)])).toBeNull();
  });

  it("ignora registros sin peso cargado", () => {
    expect(
      computeWeightChange([record("2026-08-01", 0), record("2026-09-01", 80)])
    ).toBeNull();
  });

  it("sin peso objetivo, o ya alcanzado, no informa cuánto falta", () => {
    expect(
      computeWeightChange([record("2026-08-01", 90), record("2026-09-01", 85)])
        ?.toTarget
    ).toBeNull();
    expect(
      computeWeightChange([
        record("2026-08-01", 90, 86),
        record("2026-09-01", 85, 86),
      ])?.toTarget
    ).toBeNull();
  });
});

describe("formato argentino", () => {
  it("coma decimal y un decimal", () => {
    expect(formatKg(95.4)).toBe("95,4 kg");
    expect(formatKg(90)).toBe("90,0 kg");
  });

  it("signo explícito en la diferencia", () => {
    expect(formatSignedKg(-19.2)).toBe("−19,2 kg");
    expect(formatSignedKg(1.3)).toBe("+1,3 kg");
    expect(formatSignedKg(0)).toBe("0,0 kg");
  });
});

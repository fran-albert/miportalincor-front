import { format } from "date-fns";
import type { NutritionData } from "@/types/Nutrition-Data/NutritionData";

export interface WeightChange {
  firstWeight: number;
  lastWeight: number;
  /** yyyy-MM-dd */
  firstDate: string;
  /** yyyy-MM-dd */
  lastDate: string;
  /** Último menos primero: negativo = bajó, positivo = subió. */
  change: number;
  /** Kilos que faltan para el peso objetivo del último registro, o null. */
  toTarget: number | null;
}

const toDay = (date: string | Date): string =>
  typeof date === "string" ? date.split("T")[0] : format(date, "yyyy-MM-dd");

const roundOneDecimal = (value: number): number => {
  const rounded = Math.round(value * 10) / 10;
  return rounded === 0 ? 0 : rounded;
};

export const computeWeightChange = (
  records: NutritionData[]
): WeightChange | null => {
  const withWeight = records
    .filter((r) => Number.isFinite(r.weight) && r.weight > 0)
    .map((r) => ({ day: toDay(r.date), weight: r.weight, target: r.targetWeight }))
    .sort((a, b) => a.day.localeCompare(b.day));

  if (withWeight.length < 2) return null;

  const first = withWeight[0];
  const last = withWeight[withWeight.length - 1];
  const remaining =
    Number.isFinite(last.target) && last.target > 0
      ? roundOneDecimal(last.weight - last.target)
      : 0;

  return {
    firstWeight: first.weight,
    lastWeight: last.weight,
    firstDate: first.day,
    lastDate: last.day,
    change: roundOneDecimal(last.weight - first.weight),
    toTarget: remaining > 0 ? remaining : null,
  };
};

export const formatDecimal = (value: number): string =>
  Math.abs(value).toFixed(1).replace(".", ",");

export const formatKg = (value: number): string => `${formatDecimal(value)} kg`;

export const formatSignedKg = (value: number): string => {
  const sign = value < 0 ? "−" : value > 0 ? "+" : "";
  return `${sign}${formatKg(value)}`;
};

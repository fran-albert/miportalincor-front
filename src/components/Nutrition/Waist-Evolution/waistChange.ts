import { format } from "date-fns";
import type { NutritionData } from "@/types/Nutrition-Data/NutritionData";

export interface WaistChange {
  firstWaist: number;
  lastWaist: number;
  /** yyyy-MM-dd */
  firstDate: string;
  /** yyyy-MM-dd */
  lastDate: string;
  /** Última menos primera: negativo = bajó, positivo = subió. */
  change: number;
}

const toDay = (date: string | Date): string =>
  typeof date === "string" ? date.split("T")[0] : format(date, "yyyy-MM-dd");

const roundOneDecimal = (value: number): number => {
  const rounded = Math.round(value * 10) / 10;
  return rounded === 0 ? 0 : rounded;
};

/** Registros con cintura tomada, ordenados por fecha. */
export const recordsWithWaist = (records: NutritionData[]): NutritionData[] =>
  records
    .filter((r) => r.waist != null && Number.isFinite(r.waist) && r.waist > 0)
    .sort((a, b) => toDay(a.date).localeCompare(toDay(b.date)));

export const computeWaistChange = (
  records: NutritionData[]
): WaistChange | null => {
  const withWaist = recordsWithWaist(records);
  if (withWaist.length < 2) return null;

  const first = withWaist[0];
  const last = withWaist[withWaist.length - 1];
  const firstWaist = first.waist as number;
  const lastWaist = last.waist as number;

  return {
    firstWaist,
    lastWaist,
    firstDate: toDay(first.date),
    lastDate: toDay(last.date),
    change: roundOneDecimal(lastWaist - firstWaist),
  };
};

export const formatSignedCm = (value: number): string => {
  const sign = value < 0 ? "−" : value > 0 ? "+" : "";
  return `${sign}${Math.abs(value).toFixed(1).replace(".", ",")} cm`;
};

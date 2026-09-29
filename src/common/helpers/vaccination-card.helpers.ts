import { formatPlanCalendarDate } from "@/common/helpers/plan-schedule.helpers";
import type {
  VaccinationApplication,
  VaccinationCardItem,
} from "@/types/Vaccination/Vaccination";

// appliedDate y recommendedDate son fechas calendario (YYYY-MM-DD): se formatean
// como texto, nunca con new Date(), que en Argentina las corre al dia anterior.
export const formatVaccinationDate = (value?: string | null): string =>
  formatPlanCalendarDate(value);

const toTimestamp = (value: Date | string): string =>
  typeof value === "string" ? value : value.toISOString();

export const sortApplicationsByAppliedDateDesc = (
  applications: VaccinationApplication[]
): VaccinationApplication[] =>
  [...applications].sort((left, right) => {
    const byAppliedDate = right.appliedDate
      .slice(0, 10)
      .localeCompare(left.appliedDate.slice(0, 10));
    if (byAppliedDate !== 0) return byAppliedDate;
    return toTimestamp(right.createdAt).localeCompare(
      toTimestamp(left.createdAt)
    );
  });

export interface VaccinationCalendarOverview {
  /** Hay dosis del calendario que corresponden hoy o mas adelante. */
  applies: boolean;
  dueNow: VaccinationCardItem[];
  upcoming: VaccinationCardItem[];
  /**
   * Dosis cuya ventana del calendario ya paso y no tienen registro. No se
   * listan como "vencidas": el carnet no tiene la historia previa del paciente.
   */
  withoutRecordCount: number;
}

const byRecommendedDate = (
  left: VaccinationCardItem,
  right: VaccinationCardItem
): number =>
  (left.recommendedDate ?? "").localeCompare(right.recommendedDate ?? "");

export const getVaccinationCalendarOverview = (
  items: VaccinationCardItem[]
): VaccinationCalendarOverview => {
  const withoutApplication = items.filter((item) => !item.application);
  const dueNow = withoutApplication
    .filter((item) => item.status === "pending")
    .sort(byRecommendedDate);
  const upcoming = withoutApplication
    .filter((item) => item.status === "upcoming")
    .sort(byRecommendedDate);

  return {
    applies: dueNow.length > 0 || upcoming.length > 0,
    dueNow,
    upcoming,
    withoutRecordCount: withoutApplication.filter(
      (item) => item.status === "overdue"
    ).length,
  };
};

export enum FrequencyPeriod {
  WEEKLY = "WEEKLY",
  BIWEEKLY = "BIWEEKLY",
  MONTHLY = "MONTHLY",
}

export const FrequencyPeriodLabels: Record<FrequencyPeriod, string> = {
  [FrequencyPeriod.WEEKLY]: "Semanal",
  [FrequencyPeriod.BIWEEKLY]: "Cada 2 semanas",
  [FrequencyPeriod.MONTHLY]: "Mensual",
};

export enum ScheduleType {
  FREQUENCY = "FREQUENCY",
  DAYS_OF_WEEK = "DAYS_OF_WEEK",
  SPECIFIC_DATES = "SPECIFIC_DATES",
}

export const ScheduleTypeLabels: Record<ScheduleType, string> = {
  [ScheduleType.FREQUENCY]: "Frecuencia",
  [ScheduleType.DAYS_OF_WEEK]: "Días de la semana",
  [ScheduleType.SPECIFIC_DATES]: "Fechas específicas",
};

export interface PlanActivityItem {
  activityId: string;
  assignedProfessionalUserId?: string;
  scheduleType?: ScheduleType;
  frequencyCount?: number;
  frequencyPeriod?: FrequencyPeriod;
  /** Días de la semana (0=domingo … 6=sábado), para DAYS_OF_WEEK */
  daysOfWeek?: number[];
  /** Fechas YYYY-MM-DD, para SPECIFIC_DATES */
  specificDates?: string[];
  notes?: string;
}

export interface CreatePlanVersionDto {
  validFrom: string;
  activities: PlanActivityItem[];
}

export interface PlanActivityResponse {
  id: string;
  activityId: string;
  activityName: string;
  assignedProfessionalUserId?: string;
  scheduleType?: ScheduleType;
  frequencyCount?: number;
  frequencyPeriod?: FrequencyPeriod;
  daysOfWeek?: number[];
  specificDates?: string[];
  notes?: string;
}

export interface PlanVersionResponse {
  id: string;
  enrollmentId: string;
  version: number;
  validFrom: string;
  validTo?: string;
  createdByUserId: string;
  activities: PlanActivityResponse[];
  createdAt?: string;
}

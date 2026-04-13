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

export interface PlanActivityItem {
  activityId: string;
  assignedProfessionalUserId?: string;
  frequencyCount: number;
  frequencyPeriod: FrequencyPeriod;
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
  frequencyCount: number;
  frequencyPeriod: FrequencyPeriod;
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

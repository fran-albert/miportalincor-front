export enum FrequencyPeriod {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
}

export const FrequencyPeriodLabels: Record<FrequencyPeriod, string> = {
  [FrequencyPeriod.DAILY]: "Diario",
  [FrequencyPeriod.WEEKLY]: "Semanal",
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

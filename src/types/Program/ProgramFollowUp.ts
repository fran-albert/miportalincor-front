export enum FollowUpEntryType {
  NOTE = "NOTE",
  MONTHLY_SUMMARY = "MONTHLY_SUMMARY",
}

export enum FollowUpVisibility {
  INTERNAL = "INTERNAL",
  PATIENT_VISIBLE = "PATIENT_VISIBLE",
}

export const FollowUpVisibilityLabels: Record<FollowUpVisibility, string> = {
  [FollowUpVisibility.INTERNAL]: "Interna",
  [FollowUpVisibility.PATIENT_VISIBLE]: "Visible para paciente",
};

export interface ProgramFollowUpSummaryContent {
  situation: string;
  evolution: string;
  nextObjective: string;
}

export interface ProgramMonthlySummaryActivitySnapshot {
  activityId: string;
  activityName: string;
  expected: number;
  attended: number;
  compliance: number;
}

export interface ProgramMonthlySummaryWeightSnapshot {
  firstWeight?: number;
  lastWeight?: number;
  deltaWeight?: number;
}

export interface ProgramMonthlySummaryMetricsSnapshot {
  period: { from: string; to: string };
  totalExpected: number;
  totalAttended: number;
  totalRecords: number;
  globalCompliance: number;
  activities: ProgramMonthlySummaryActivitySnapshot[];
  nutrition?: ProgramMonthlySummaryWeightSnapshot;
}

export interface ProgramFollowUpEntry {
  id: string;
  enrollmentId: string;
  authorUserId: string;
  authorFirstName?: string;
  authorLastName?: string;
  entryType: FollowUpEntryType;
  visibility: FollowUpVisibility;
  title?: string;
  content?: string;
  periodYear?: number;
  periodMonth?: number;
  summaryContent?: ProgramFollowUpSummaryContent;
  metricsSnapshot?: ProgramMonthlySummaryMetricsSnapshot;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProgramMonthlySummaryDetail {
  entry?: ProgramFollowUpEntry | null;
  snapshot?: ProgramMonthlySummaryMetricsSnapshot;
}

export interface CreateFollowUpNoteDto {
  title?: string;
  content: string;
  visibility: FollowUpVisibility;
}

export interface UpdateFollowUpNoteDto {
  title?: string;
  content?: string;
  visibility?: FollowUpVisibility;
}

export interface UpsertMonthlySummaryDto {
  title?: string;
  situation: string;
  evolution: string;
  nextObjective: string;
  visibility: FollowUpVisibility;
}

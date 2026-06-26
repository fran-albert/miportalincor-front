export interface MedicalEvaluationReportVersion {
  id: number;
  medicalEvaluationId: number;
  version: number;
  fileName: string;
  storageKey: string;
  generatedAt: string;
  generatedByUserId: string | null;
  generatedByEmail: string | null;
  isCurrent: boolean;
  isFinal: boolean;
  outdatedByExamChanges: boolean;
  source: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface MedicalEvaluationReportVersionsSummary {
  currentVersion: MedicalEvaluationReportVersion | null;
  finalVersion: MedicalEvaluationReportVersion | null;
  versions: MedicalEvaluationReportVersion[];
}

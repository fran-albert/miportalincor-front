import { ReportVisibilityOverrides } from "@/common/helpers/report-visibility";

export interface MedicalEvaluationMaintenanceState {
  medicalEvaluationId: number;
  doctorId: number | null;
  completed: boolean;
  hasStudies: boolean;
  hasClinicalData: boolean;
  canDelete: boolean;
  deleteReasons: string[];
}

export interface UpdateMedicalEvaluationDto {
  doctorId?: number;
  evaluationTypeId?: number;
  reportVisibilityOverrides?: ReportVisibilityOverrides;
}

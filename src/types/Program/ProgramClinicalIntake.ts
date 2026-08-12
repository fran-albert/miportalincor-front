import { PlanActivityItem } from "@/types/Program/ProgramPlan";

export enum ProgramMetricKey {
  PAIN_SCORE = "PAIN_SCORE",
}

/** "PRÓXIMO CONTROL MÉDICO" de la ficha de papel de la Unidad del Dolor. */
export enum NextControlSchedule {
  FIFTEEN_DAYS = "FIFTEEN_DAYS",
  ONE_MONTH = "ONE_MONTH",
  AT_END_OF_SESSIONS = "AT_END_OF_SESSIONS",
  OTHER = "OTHER",
}

export const NextControlScheduleLabels: Record<NextControlSchedule, string> = {
  [NextControlSchedule.FIFTEEN_DAYS]: "15 días",
  [NextControlSchedule.ONE_MONTH]: "1 mes",
  [NextControlSchedule.AT_END_OF_SESSIONS]: "Al finalizar las sesiones",
  [NextControlSchedule.OTHER]: "Otra fecha",
};

/** "Tipo de ejercicio indicado" para el gimnasio. */
export enum TherapeuticExerciseType {
  MOBILITY_AND_STRETCHING = "MOBILITY_AND_STRETCHING",
  SPECIFIC_STRENGTHENING = "SPECIFIC_STRENGTHENING",
  POSTURAL_REEDUCATION = "POSTURAL_REEDUCATION",
}

export const TherapeuticExerciseTypeLabels: Record<
  TherapeuticExerciseType,
  string
> = {
  [TherapeuticExerciseType.MOBILITY_AND_STRETCHING]: "Movilidad y elongación",
  [TherapeuticExerciseType.SPECIFIC_STRENGTHENING]:
    "Fortalecimiento específico",
  [TherapeuticExerciseType.POSTURAL_REEDUCATION]: "Reeducación postural",
};

export enum MedicalEvaluationField {
  DIAGNOSIS = "DIAGNOSIS",
  INITIAL_SCORE = "INITIAL_SCORE",
  REFERRAL_WITH_FREQUENCY = "REFERRAL_WITH_FREQUENCY",
  PHARMACOLOGICAL_TREATMENT = "PHARMACOLOGICAL_TREATMENT",
  CONTRAINDICATIONS = "CONTRAINDICATIONS",
  THERAPEUTIC_GOAL = "THERAPEUTIC_GOAL",
  NEXT_CONTROL = "NEXT_CONTROL",
}

export const MedicalEvaluationFieldLabels: Record<
  MedicalEvaluationField,
  string
> = {
  [MedicalEvaluationField.DIAGNOSIS]: "Diagnóstico",
  [MedicalEvaluationField.INITIAL_SCORE]: "Nivel de dolor inicial",
  [MedicalEvaluationField.REFERRAL_WITH_FREQUENCY]:
    "Derivación con frecuencia semanal",
  [MedicalEvaluationField.PHARMACOLOGICAL_TREATMENT]:
    "Tratamiento farmacológico",
  [MedicalEvaluationField.CONTRAINDICATIONS]: "Zonas a evitar",
  [MedicalEvaluationField.THERAPEUTIC_GOAL]: "Objetivo terapéutico",
  [MedicalEvaluationField.NEXT_CONTROL]: "Próximo control",
};

export interface MedicalEvaluationResponse {
  id: string;
  enrollmentId: string;
  authorUserId: string;
  authorFirstName?: string;
  authorLastName?: string;
  evaluatedAt: string;
  diagnosis: string;
  pharmacologicalTreatment?: string;
  contraindications?: string;
  nextControlSchedule?: NextControlSchedule;
  nextControlDate?: string;
  metricKey: ProgramMetricKey;
  initialScore?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MedicalEvaluationCompleteness {
  missingRequired: MedicalEvaluationField[];
  missingRecommended: MedicalEvaluationField[];
  isComplete: boolean;
}

export interface MedicalEvaluationDetail {
  evaluation: MedicalEvaluationResponse | null;
  completeness: MedicalEvaluationCompleteness;
  clinicalIntakeEnabled: boolean;
}

export interface MedicalEvaluationReferralDto {
  validFrom?: string;
  activities: PlanActivityItem[];
}

export interface UpsertMedicalEvaluationDto {
  evaluatedAt?: string;
  diagnosis: string;
  initialScore: number;
  pharmacologicalTreatment?: string;
  contraindications?: string;
  nextControlSchedule?: NextControlSchedule;
  nextControlDate?: string;
  referral?: MedicalEvaluationReferralDto;
}

export interface MeasurementResponse {
  id: string;
  enrollmentId: string;
  metricKey: ProgramMetricKey;
  value: number;
  measuredAt: string;
  authorUserId: string;
  authorFirstName?: string;
  authorLastName?: string;
  note?: string;
  isInitial: boolean;
  createdAt?: string;
}

export interface MeasurementMetric {
  key: ProgramMetricKey;
  label: string;
  min: number;
  max: number;
  lowerIsBetter: boolean;
}

export interface MeasurementSeries {
  metric: MeasurementMetric;
  entries: MeasurementResponse[];
  firstValue?: number;
  lastValue?: number;
  delta?: number;
}

export interface CreateMeasurementDto {
  metricKey?: ProgramMetricKey;
  value: number;
  measuredAt?: string;
  note?: string;
}

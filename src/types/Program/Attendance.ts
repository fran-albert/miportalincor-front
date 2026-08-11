export enum AttendanceMethod {
  QR_SCAN = "QR_SCAN",
  MANUAL = "MANUAL",
}

export const AttendanceMethodLabels: Record<AttendanceMethod, string> = {
  [AttendanceMethod.QR_SCAN]: "QR",
  [AttendanceMethod.MANUAL]: "Manual",
};

export interface AttendanceRecord {
  id: string;
  enrollmentId: string;
  activityId: string;
  activityName?: string;
  patientUserId: string;
  markedByUserId: string;
  method: AttendanceMethod;
  attendedAt: string;
  /** No había plan vigente esa fecha: la asistencia quedó sin denominador. */
  withoutActivePlan?: boolean;
}

export interface ManualAttendanceDto {
  enrollmentId: string;
  activityId: string;
  patientUserId: string;
}

export interface ComplianceRecord {
  date: string;
  method: AttendanceMethod;
  /** No había plan vigente esa fecha. */
  withoutActivePlan?: boolean;
}

export interface ActivityCompliance {
  activityId: string;
  activityName: string;
  expected: number;
  attended: number;
  compliance: number;
  records: ComplianceRecord[];
  /** Cuántas de esas asistencias se marcaron sin plan vigente. */
  recordsWithoutActivePlan?: number;
}

export interface ComplianceResponse {
  enrollmentId: string;
  period: { from: string; to: string };
  globalCompliance: number;
  activities: ActivityCompliance[];
  /** Total de asistencias del período marcadas sin plan vigente. */
  recordsWithoutActivePlan?: number;
}

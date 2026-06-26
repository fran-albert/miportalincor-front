export enum AttendanceMethod {
  QR = "QR",
  MANUAL = "MANUAL",
}

export const AttendanceMethodLabels: Record<AttendanceMethod, string> = {
  [AttendanceMethod.QR]: "QR",
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
}

export interface ManualAttendanceDto {
  enrollmentId: string;
  activityId: string;
  patientUserId: string;
}

export interface ComplianceRecord {
  date: string;
  method: AttendanceMethod;
}

export interface ActivityCompliance {
  activityId: string;
  activityName: string;
  expected: number;
  attended: number;
  compliance: number;
  records: ComplianceRecord[];
}

export interface ComplianceResponse {
  enrollmentId: string;
  period: { from: string; to: string };
  globalCompliance: number;
  activities: ActivityCompliance[];
}

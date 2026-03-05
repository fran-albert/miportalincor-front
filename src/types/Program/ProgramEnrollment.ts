export enum EnrollmentStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  SUSPENDED = "SUSPENDED",
  CANCELLED = "CANCELLED",
}

export const EnrollmentStatusLabels: Record<EnrollmentStatus, string> = {
  [EnrollmentStatus.ACTIVE]: "Activo",
  [EnrollmentStatus.COMPLETED]: "Completado",
  [EnrollmentStatus.SUSPENDED]: "Suspendido",
  [EnrollmentStatus.CANCELLED]: "Cancelado",
};

export const EnrollmentStatusColors: Record<EnrollmentStatus, string> = {
  [EnrollmentStatus.ACTIVE]: "bg-green-100 text-green-800",
  [EnrollmentStatus.COMPLETED]: "bg-blue-100 text-blue-800",
  [EnrollmentStatus.SUSPENDED]: "bg-yellow-100 text-yellow-800",
  [EnrollmentStatus.CANCELLED]: "bg-red-100 text-red-800",
};

export interface ProgramEnrollment {
  id: string;
  programId: string;
  patientUserId: string;
  patientFirstName?: string;
  patientLastName?: string;
  programName?: string;
  enrolledAt: string;
  status: EnrollmentStatus;
  createdAt?: string;
}

export interface EnrollPatientDto {
  patientUserId: string;
}

export interface UpdateEnrollmentStatusDto {
  status: EnrollmentStatus;
}

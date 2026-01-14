import { Base } from "../Base/Base";

export enum PrescriptionRequestStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

export interface PatientSummary {
  id: string;
  firstName: string;
  lastName: string;
  userName?: string;
  phoneNumber?: string;
}

export interface DoctorSummary {
  id: string;
  firstName: string;
  lastName: string;
  gender?: string;
  specialities?: string[];
}

export interface PrescriptionRequest extends Base {
  patientUserId: string;
  doctorUserId: string;
  description: string;
  attachmentUrls?: string[];
  status: PrescriptionRequestStatus;
  prescriptionUrls?: string[];
  prescriptionLink?: string;
  doctorNotes?: string;
  rejectedReason?: string;
  completedAt?: string;
  patient?: PatientSummary;
  doctor?: DoctorSummary;
}

export interface CreatePrescriptionRequestDto {
  doctorUserId: string;
  description: string;
  attachmentUrls?: string[];
}

export interface CompletePrescriptionRequestDto {
  prescriptionUrls?: string[];
  prescriptionLink?: string;
  doctorNotes?: string;
}

export interface RejectPrescriptionRequestDto {
  reason: string;
}

export interface PrescriptionRequestFilters {
  status?: PrescriptionRequestStatus;
  doctorUserId?: string;
  patientUserId?: string;
}

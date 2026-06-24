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
  affiliationNumber?: string;
  healthInsuranceName?: string;
  healthPlans?:
    | {
        id?: number;
        name?: string;
        healthInsurance?: {
          id?: number;
          name: string;
        };
      }[]
    | null;
}

export interface DoctorSummary {
  id: string;
  firstName: string;
  lastName: string;
  gender?: string;
  specialities?: string[];
}

export interface PrescriptionRequestPeriodicCheckupItem {
  id: number;
  checkupTypeId: number;
  checkupTypeName?: string;
  specialityName?: string;
  lastCheckupDate?: string;
  nextDueDate: string;
  isActive: boolean;
}

export interface PrescriptionRequestPeriodicCheckupSummary {
  total: number;
  overdueCount: number;
  upcomingCount: number;
  items: PrescriptionRequestPeriodicCheckupItem[];
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
  signingDoctor?: DoctorSummary;
  greenCardItemId?: string;
  batchId?: string;
  periodicCheckup?: PrescriptionRequestPeriodicCheckupSummary;
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

export interface SearchPrescriptionRequestParams {
  search?: string;
  page?: number;
  limit?: number;
  status?: PrescriptionRequestStatus;
}

export interface PaginatedPrescriptionRequests {
  data: PrescriptionRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

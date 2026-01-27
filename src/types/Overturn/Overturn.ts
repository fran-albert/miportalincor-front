import { DoctorBasicDto, PatientBasicDto } from '../Appointment/Appointment';

// ============================================
// ENUMS
// ============================================

export enum OverturnStatus {
  PENDING = 'PENDING',
  WAITING = 'WAITING',
  ATTENDING = 'ATTENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED_BY_PATIENT = 'CANCELLED_BY_PATIENT',
  CANCELLED_BY_SECRETARY = 'CANCELLED_BY_SECRETARY',
}

export const OverturnStatusLabels: Record<OverturnStatus, string> = {
  [OverturnStatus.PENDING]: 'Pendiente',
  [OverturnStatus.WAITING]: 'En espera',
  [OverturnStatus.ATTENDING]: 'En atención',
  [OverturnStatus.COMPLETED]: 'Completado',
  [OverturnStatus.CANCELLED_BY_PATIENT]: 'Cancelado (paciente)',
  [OverturnStatus.CANCELLED_BY_SECRETARY]: 'Cancelado (secretaria)',
};

export const OverturnStatusColors: Record<OverturnStatus, string> = {
  [OverturnStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [OverturnStatus.WAITING]: 'bg-orange-100 text-orange-800',
  [OverturnStatus.ATTENDING]: 'bg-purple-100 text-purple-800',
  [OverturnStatus.COMPLETED]: 'bg-green-100 text-green-800',
  [OverturnStatus.CANCELLED_BY_PATIENT]: 'bg-red-100 text-red-800',
  [OverturnStatus.CANCELLED_BY_SECRETARY]: 'bg-red-100 text-red-800',
};

export const ALLOWED_OVERTURN_TRANSITIONS: Record<OverturnStatus, OverturnStatus[]> = {
  [OverturnStatus.PENDING]: [
    OverturnStatus.WAITING,
    OverturnStatus.CANCELLED_BY_PATIENT,
    OverturnStatus.CANCELLED_BY_SECRETARY,
  ],
  [OverturnStatus.WAITING]: [
    OverturnStatus.ATTENDING,
    OverturnStatus.CANCELLED_BY_PATIENT,
    OverturnStatus.CANCELLED_BY_SECRETARY,
  ],
  [OverturnStatus.ATTENDING]: [OverturnStatus.COMPLETED],
  [OverturnStatus.COMPLETED]: [],
  [OverturnStatus.CANCELLED_BY_PATIENT]: [],
  [OverturnStatus.CANCELLED_BY_SECRETARY]: [],
};

// ============================================
// RESPONSE DTOs
// ============================================

export interface OverturnResponseDto {
  id: number;
  doctorId: number;
  patientId?: number;
  date: string;
  hour: string;
  status: OverturnStatus;
  isGuest: boolean;
  guestDocumentNumber?: string;
  guestFirstName?: string;
  guestLastName?: string;
  guestPhone?: string;
  guestEmail?: string;
  reason?: string;
  createdBy: number;
  createdAt: string;
}

export interface OverturnDetailedDto extends OverturnResponseDto {
  patient?: PatientBasicDto;
  doctor?: DoctorBasicDto;
}

// ============================================
// CREATE/UPDATE DTOs
// ============================================

export interface CreateOverturnDto {
  doctorId: number;
  patientId: number;
  date: string;
  hour: string;
  reason?: string;
}

export interface UpdateOverturnStatusDto {
  status: OverturnStatus;
}

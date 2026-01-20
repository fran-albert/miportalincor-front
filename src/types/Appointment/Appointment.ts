import { Doctor } from "../Doctor/Doctor";
import { Notification } from "../Notifications/Notifications";
import { Patient } from "../Patient/Patient";

// ============================================
// ENUMS
// ============================================

export enum AppointmentStatus {
  // Origen
  REQUESTED_BY_PATIENT = 'REQUESTED_BY_PATIENT',
  ASSIGNED_BY_SECRETARY = 'ASSIGNED_BY_SECRETARY',

  // Flujo de atención
  PENDING = 'PENDING',
  WAITING = 'WAITING',
  ATTENDING = 'ATTENDING',
  COMPLETED = 'COMPLETED',

  // Cancelaciones
  CANCELLED_BY_PATIENT = 'CANCELLED_BY_PATIENT',
  CANCELLED_BY_SECRETARY = 'CANCELLED_BY_SECRETARY',
}

export enum AppointmentOrigin {
  WEB_GUEST = 'WEB_GUEST',       // Invitado desde turnos.incor.ui (DNI no existe en BD)
  WEB_PATIENT = 'WEB_PATIENT',   // Paciente registrado (desde su cuenta o web pública con DNI existente)
  SECRETARY = 'SECRETARY',       // Secretaría desde miportalincor-front
}

export const AppointmentOriginLabels: Record<AppointmentOrigin, string> = {
  [AppointmentOrigin.WEB_GUEST]: 'Invitado (web pública)',
  [AppointmentOrigin.WEB_PATIENT]: 'Paciente (web)',
  [AppointmentOrigin.SECRETARY]: 'Secretaría',
};

export const AppointmentStatusLabels: Record<AppointmentStatus, string> = {
  [AppointmentStatus.REQUESTED_BY_PATIENT]: 'Solicitado (paciente)',
  [AppointmentStatus.ASSIGNED_BY_SECRETARY]: 'Asignado (secretaria)',
  [AppointmentStatus.PENDING]: 'Pendiente',
  [AppointmentStatus.WAITING]: 'En espera',
  [AppointmentStatus.ATTENDING]: 'En atención',
  [AppointmentStatus.COMPLETED]: 'Completado',
  [AppointmentStatus.CANCELLED_BY_PATIENT]: 'Cancelado (paciente)',
  [AppointmentStatus.CANCELLED_BY_SECRETARY]: 'Cancelado (secretaria)',
};

export const AppointmentStatusColors: Record<AppointmentStatus, string> = {
  [AppointmentStatus.REQUESTED_BY_PATIENT]: 'bg-blue-100 text-blue-800',
  [AppointmentStatus.ASSIGNED_BY_SECRETARY]: 'bg-indigo-100 text-indigo-800',
  [AppointmentStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [AppointmentStatus.WAITING]: 'bg-orange-100 text-orange-800',
  [AppointmentStatus.ATTENDING]: 'bg-purple-100 text-purple-800',
  [AppointmentStatus.COMPLETED]: 'bg-green-100 text-green-800',
  [AppointmentStatus.CANCELLED_BY_PATIENT]: 'bg-red-100 text-red-800',
  [AppointmentStatus.CANCELLED_BY_SECRETARY]: 'bg-red-100 text-red-800',
};

export const ALLOWED_TRANSITIONS: Partial<Record<AppointmentStatus, AppointmentStatus[]>> = {
  [AppointmentStatus.PENDING]: [
    AppointmentStatus.WAITING,
    AppointmentStatus.CANCELLED_BY_PATIENT,
    AppointmentStatus.CANCELLED_BY_SECRETARY,
  ],
  [AppointmentStatus.WAITING]: [
    AppointmentStatus.ATTENDING,
    AppointmentStatus.CANCELLED_BY_PATIENT,
    AppointmentStatus.CANCELLED_BY_SECRETARY,
  ],
  [AppointmentStatus.ATTENDING]: [AppointmentStatus.COMPLETED],
};

// ============================================
// BASIC DTOs (para relaciones)
// ============================================

export interface PatientBasicDto {
  userId: number;
  firstName: string;
  lastName: string;
  userName?: string;
}

export interface DoctorBasicDto {
  userId: number;
  firstName: string;
  lastName: string;
  gender?: string;
  specialities?: { id: number; name: string }[];
}

// ============================================
// RESPONSE DTOs
// ============================================

export interface AppointmentResponseDto {
  id: number;
  doctorId: number;
  patientId: number | null;
  date: string;
  hour: string;
  status: AppointmentStatus;
  origin?: AppointmentOrigin | null;
  createdAt: string;
  updatedAt: string;
  // Guest fields (backend returns 0/1 from MySQL, but may also return boolean)
  isGuest?: boolean | number;
  guestFirstName?: string;
  guestLastName?: string;
  guestDocumentNumber?: string;
  guestPhone?: string;
  guestEmail?: string;
}

export interface AppointmentWithPatientDto extends AppointmentResponseDto {
  patient?: PatientBasicDto | null;
}

export interface AppointmentDetailedDto {
  id: number;
  date: string;
  hour: string;
  status: AppointmentStatus;
  origin?: AppointmentOrigin | null;
  isGuest?: boolean | number;
  patient?: PatientBasicDto | null;
  doctor?: DoctorBasicDto | null;
}

export interface AppointmentFullResponseDto extends AppointmentResponseDto {
  patient?: PatientBasicDto | null;
  doctor?: DoctorBasicDto | null;
}

// ============================================
// CREATE/UPDATE DTOs
// ============================================

export interface CreateAppointmentDto {
  doctorId: number;
  patientId: number;
  date: string;
  hour: string;
}

export interface UpdateAppointmentDto {
  date?: string;
  hour?: string;
}

export interface UpdateAppointmentStatusDto {
  status: AppointmentStatus;
}

// ============================================
// SLOTS
// ============================================

export interface AvailableSlot {
  hour: string;
  available: boolean;
}

// ============================================
// LEGACY (para compatibilidad temporal)
// ============================================

export interface Appointment {
  doctorId: number;
  patientId: number;
  date: string;
  hour: string;
  status: AppointmentStatus;
  notifications: Notification[];
}

/** @deprecated - Usar AppointmentFullResponseDto */
export interface AppointmentWithPatientDtoLegacy {
  id: number;
  doctorId: number;
  date: string;
  hour: string;
  status: AppointmentStatus;
  notifications: Notification[];
  patient: {
    firstName: string;
    lastName: string;
    userId: number;
  } | null;
  doctor?: Partial<Doctor> | null;
}

/** @deprecated - Usar AppointmentFullResponseDto */
export interface AppointmentResponseDtoLegacy {
  id: number;
  date: string;
  hour: string;
  status: AppointmentStatus;
  notifications?: Notification[];
  doctor: Partial<Doctor> | null;
  patient: Partial<Patient> | null;
  paciente?: string;
  fecha?: string;
  hora?: string;
  tipo?: string;
  estado?: string;
}

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
  DOCTOR = 'DOCTOR',             // Médico desde miportalincor-front (autogestión)
}

export const AppointmentOriginLabels: Record<AppointmentOrigin, string> = {
  [AppointmentOrigin.WEB_GUEST]: 'Invitado (web pública)',
  [AppointmentOrigin.WEB_PATIENT]: 'Paciente (web)',
  [AppointmentOrigin.SECRETARY]: 'Secretaría',
  [AppointmentOrigin.DOCTOR]: 'Médico (autogestión)',
};

export enum AppointmentStatusTransitionContext {
  RECEPTION_FLOW = 'RECEPTION_FLOW',
  CALENDAR_OVERRIDE = 'CALENDAR_OVERRIDE',
}

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

export const OPERATIONAL_TRANSITIONS: Partial<Record<AppointmentStatus, AppointmentStatus[]>> = {
  [AppointmentStatus.PENDING]: [
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
  /** DNI del paciente */
  userName?: string;
  /** Teléfono del paciente */
  phoneNumber?: string;
  /** Número de afiliado */
  affiliationNumber?: string;
  /** Nombre de la obra social */
  healthInsuranceName?: string;
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
  // Consultation type
  consultationTypeId?: number | null;
  consultationTypeIds?: number[];
  consultationType?: ConsultationTypeBasicDto | null;
  consultationTypes?: ConsultationTypeBasicDto[];
  // Duration
  durationMinutes?: number | null;
  // Control ginecológico integral
  linkedOverturnId?: number | null;
  /** La otra pata cuando las dos son turnos reales (v2). */
  linkedAppointmentId?: number | null;
  integralCheckup?: IntegralCheckupLink | null;
}

export interface AppointmentWithPatientDto extends AppointmentResponseDto {
  patient?: PatientBasicDto | null;
}

// ============================================
// CONTROL GINECOLÓGICO INTEGRAL
// ============================================

/**
 * La otra pata del control, vista desde un turno o desde un sobreturno.
 *
 * Su sola presencia es lo que marca un turno como parte de un control
 * integral: el fucsia se pinta por esto y NO por `consultationType.color`.
 */
export interface IntegralCheckupLink {
  role: "CONSULTATION" | "ULTRASOUND";
  counterpartType: "APPOINTMENT" | "OVERTURN";
  counterpartId: number;
  counterpartDoctorId: number;
  counterpartDoctorFirstName?: string;
  counterpartDoctorLastName?: string;
  counterpartDate: string;
  counterpartHour: string;
  /** El nombre REAL del catálogo: es lo que ven recepción y las médicas. */
  counterpartDescription: string;
  /**
   * Lo mismo con el nombre PÚBLICO: es lo único que se le puede mostrar a la
   * paciente. Para los subtipos de ecografía dice "Ecografía" a secas — el
   * subtipo lo indica la médica y la paciente no lo ve.
   */
  counterpartPublicDescription?: string;
  /**
   * El color del control, tal como lo define el catálogo. Viaja en el vínculo
   * porque un sobreturno no puede tener tipo de consulta.
   */
  color?: string;
}

/**
 * Un día con el control integral disponible.
 *
 * 🔴 Los dos horarios vienen del backend y NO se asume cuál va primero: en el
 * circuito viejo la eco va antes de la consulta y en el nuevo, después. Quien
 * los muestre tiene que ordenarlos por hora, nunca por el nombre del campo.
 */
export interface IntegralCheckupSlot {
  date: string;
  consultationHour: string;
  ultrasoundHour: string;
  /**
   * Cómo nombrar la ecografía frente a la paciente, cuando el catálogo lo
   * impone. Si no viene, el portal usa su texto de siempre.
   */
  ultrasoundPublicLabel?: string;
  /**
   * Las dos profesionales del control. Son config de instancia y las manda el
   * backend: el front resuelve el nombre con el id, nunca los cablea.
   */
  consultationDoctorId?: number;
  ultrasoundDoctorId?: number;
  /**
   * El nombre REAL de la ecografía en el catálogo. Viene SOLO en el endpoint
   * del personal: la secretaria no es la paciente y necesita ver qué está
   * dando. En el endpoint de la paciente no viaja.
   */
  ultrasoundLabel?: string;
}

/** Una sola reserva, dos momentos. */
export interface IntegralCheckupBooking {
  consultation: AppointmentResponseDto;
  ultrasound: {
    id: number;
    doctorId: number;
    date: string;
    hour: string;
    /** Con el nombre público: "Ecografía" a secas en el circuito nuevo. */
    reason: string;
    /** Sobreturno (circuito viejo) o turno real de la ecografista (nuevo). */
    kind?: "OVERTURN" | "APPOINTMENT";
  };
  /** True cuando la consulta va primero y la eco después. */
  consultationFirst?: boolean;
}

export interface AppointmentDetailedDto {
  id: number;
  date: string;
  hour: string;
  status: AppointmentStatus;
  origin?: AppointmentOrigin | null;
  isGuest?: boolean | number;
  consultationTypeId?: number | null;
  consultationTypeIds?: number[];
  consultationType?: ConsultationTypeBasicDto | null;
  consultationTypes?: ConsultationTypeBasicDto[];
  linkedOverturnId?: number | null;
  linkedAppointmentId?: number | null;
  integralCheckup?: IntegralCheckupLink | null;
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

export interface ConsultationTypeBasicDto {
  id: number;
  name: string;
  /**
   * Cómo se le muestra este tipo al PACIENTE. Vacío = se muestra `name`.
   *
   * 🔴 En pantallas de paciente usá `publicNameOf(type)`, nunca `name` a
   * secas: los subtipos de ecografía de Incor traen "Ecografía" acá, porque
   * el subtipo lo indica la médica y la paciente no lo ve.
   */
  publicName?: string | null;
  color?: string;
}

/** El nombre que le corresponde a un tipo según quién esté mirando. */
export const publicNameOf = (
  type: Pick<ConsultationTypeBasicDto, "name" | "publicName">,
): string => type.publicName?.trim() || type.name;

export interface CreateAppointmentDto {
  doctorId: number;
  patientId: number;
  date: string;
  hour: string;
  consultationTypeId?: number;
  consultationTypeIds?: number[];
}

export interface UpdateAppointmentDto {
  date?: string;
  hour?: string;
  consultationTypeId?: number;
  consultationTypeIds?: number[];
}

export interface RescheduleAppointmentDto {
  date: string;
  hour: string;
}

export interface UpdateAppointmentStatusDto {
  status: AppointmentStatus;
  context?: AppointmentStatusTransitionContext;
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

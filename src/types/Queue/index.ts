export type QueueStatus = 'WAITING' | 'CALLED' | 'ATTENDING' | 'COMPLETED' | 'NO_SHOW';

export type AppointmentType = 'SCHEDULED_APPOINTMENT' | 'WALK_IN' | 'ADMINISTRATIVE';
export type QueueCallDestination = 'RECEPCION' | 'VENTANILLA';

export type QueueRegistrationResolutionType =
  | 'CREATED_NEW_PATIENT'
  | 'LINKED_EXISTING_PATIENT';

export type QueueRegistrationResolutionType =
  | 'CREATED_NEW_PATIENT'
  | 'LINKED_EXISTING_PATIENT';

export interface QueueEntry {
  id: number;
  appointmentId?: number;
  overturnId?: number;
  appointmentType: AppointmentType;
  patientId: number | null;
  patientName: string;
  patientDocument: string;
  isGuest: boolean;
  doctorId: number;
  doctorName: string;
  speciality?: string;
  consultationTypeName?: string;
  scheduledTime: string;
  status: QueueStatus;
  displayNumber: string;
  queueNumber: number;
  queuePrefix: string;
  checkedInAt: string;
  medicalWaitingSince?: string;
  calledAt?: string;
  attendedAt?: string;
  completedAt?: string;
  servicePoint?: string;
  calledBy?: string;
  waitingTimeMinutes?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface QueueStats {
  waiting: number;
  called: number;
  attending: number;
  completed: number;
  noShow: number;
  averageWaitTimeMinutes: number;
}

export interface CallPatientDto {
  servicePoint: QueueCallDestination;
}

export interface CallSpecificPatientDto {
  queueEntryId: number;
  servicePoint: QueueCallDestination;
}

export interface CorrectQueueDocumentDto {
  queueEntryId: number;
  document: string;
}

export interface ChangeQueueStatusDto {
  status: QueueStatus;
}

export interface RegisterQueuePatientDto {
  queueEntryId: number;
  patientId: number;
  resolutionType?: QueueRegistrationResolutionType;
}

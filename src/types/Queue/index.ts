export type QueueStatus = 'WAITING' | 'CALLED' | 'ATTENDING' | 'COMPLETED' | 'NO_SHOW';

export type AppointmentType = 'SCHEDULED_APPOINTMENT' | 'WALK_IN' | 'ADMINISTRATIVE';

export interface QueueEntry {
  id: number;
  appointmentId?: number;
  overturnId?: number;
  appointmentType: AppointmentType;
  patientId: number;
  patientName: string;
  patientDocument: string;
  doctorId: number;
  doctorName: string;
  speciality: string;
  scheduledTime: string;
  status: QueueStatus;
  displayNumber: string;
  queueNumber: number;
  queuePrefix: string;
  checkedInAt: string;
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
  servicePoint: string;
}

export interface CallSpecificPatientDto {
  queueEntryId: number;
  servicePoint: string;
}

export interface ChangeQueueStatusDto {
  status: QueueStatus;
}

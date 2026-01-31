export interface CheckupType {
  id: number;
  name: string;
  description?: string;
  specialityId?: number;
  specialityName?: string;
  frequencyMonths: number;
  reminderDays: number[];
  isActive: boolean;
}

export interface PatientCheckupSchedule {
  id: number;
  patientId: number;
  checkupTypeId: number;
  doctorId?: number;
  lastCheckupDate?: string;
  nextDueDate: string;
  remindersSent: number[];
  notes?: string;
  isActive: boolean;
  checkupType?: CheckupType;
}

export interface CreateCheckupTypeDto {
  name: string;
  description?: string;
  specialityId?: number;
  specialityName?: string;
  frequencyMonths: number;
  reminderDays?: number[];
  isActive?: boolean;
}

export interface UpdateCheckupTypeDto {
  name?: string;
  description?: string;
  specialityId?: number;
  specialityName?: string;
  frequencyMonths?: number;
  reminderDays?: number[];
  isActive?: boolean;
}

export interface CreatePatientScheduleDto {
  patientId: number;
  checkupTypeId: number;
  doctorId?: number;
  lastCheckupDate?: string;
  nextDueDate?: string;
  notes?: string;
}

export interface UpdatePatientScheduleDto {
  doctorId?: number;
  lastCheckupDate?: string;
  nextDueDate?: string;
  notes?: string;
  isActive?: boolean;
}

export interface CompleteCheckupDto {
  completedDate: string;
  notes?: string;
}

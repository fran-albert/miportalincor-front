export interface CreateDoctorScheduleExceptionDto {
  doctorId: number;
  date: string;
  startTime: string;
  endTime: string;
  slotDuration?: number;
  isActive?: boolean;
}

export interface UpdateDoctorScheduleExceptionDto {
  doctorId?: number;
  date?: string;
  startTime?: string;
  endTime?: string;
  slotDuration?: number;
  isActive?: boolean;
}

export interface DoctorScheduleExceptionResponseDto {
  id: number;
  doctorId: number;
  date: string;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
  outsideExistingAppointmentsCount?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO para actualizar configuración de reservas de médico
 */
export interface UpdateDoctorBookingSettingsDto {
  allowOnlineBooking?: boolean;
  canSelfManageSchedule?: boolean;
}

/**
 * DTO de respuesta de configuración de reservas de médico
 */
export interface DoctorBookingSettingsResponseDto {
  id: number;
  doctorId: number;
  allowOnlineBooking: boolean;
  canSelfManageSchedule: boolean;
  createdAt: string;
  updatedAt: string;
}

import { apiTurnos } from "@/services/axiosConfig";
import { AppointmentFullResponseDto } from "@/types/Appointment/Appointment";

/**
 * Obtiene los turnos del día del médico logueado.
 */
export const getMyTodayAppointments = async (): Promise<AppointmentFullResponseDto[]> => {
  const { data } = await apiTurnos.get<AppointmentFullResponseDto[]>(
    'appointments/doctor/me/today'
  );
  return data;
};

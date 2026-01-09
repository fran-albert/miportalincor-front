import { apiTurnos } from "@/services/axiosConfig";
import { AppointmentFullResponseDto } from "@/types/Appointment/Appointment";

/**
 * Obtener turnos del paciente autenticado
 * El backend extrae el patientId del JWT token
 */
export const getAppointmentsByPatient = async (
  _patientId?: number
): Promise<AppointmentFullResponseDto[]> => {
  const { data } = await apiTurnos.get<AppointmentFullResponseDto[]>(
    'appointments/patient/my-appointments'
  );
  return data;
};

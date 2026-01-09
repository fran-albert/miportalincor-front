import { getAllAppointments, GetAllAppointmentsParams } from './get-all.action';
import { AppointmentFullResponseDto } from "@/types/Appointment/Appointment";

/**
 * Obtener turnos de un paciente específico (para Admin/Secretaria/Doctor)
 * A diferencia de getAppointmentsByPatient que usa JWT del usuario autenticado,
 * este servicio permite consultar turnos de cualquier paciente por su userId.
 */
export const getAppointmentsByPatientId = async (
  patientId: number,
  params?: Omit<GetAllAppointmentsParams, 'patientId'>
): Promise<AppointmentFullResponseDto[]> => {
  const response = await getAllAppointments({
    patientId,
    limit: params?.limit ?? 100,
    ...params,
  });

  return response.data;
};

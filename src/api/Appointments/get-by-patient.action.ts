import { apiTurnos } from "@/services/axiosConfig";
import { AppointmentFullResponseDto } from "@/types/Appointment/Appointment";

export const getAppointmentsByPatient = async (
  patientId: number
): Promise<AppointmentFullResponseDto[]> => {
  const { data } = await apiTurnos.get<AppointmentFullResponseDto[]>(
    `appointments/patient/${patientId}`
  );
  return data;
};

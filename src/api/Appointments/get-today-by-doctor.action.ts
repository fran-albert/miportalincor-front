import { apiTurnos } from "@/services/axiosConfig";
import { AppointmentFullResponseDto } from "@/types/Appointment/Appointment";

export const getTodayAppointmentsByDoctor = async (
  doctorId: number
): Promise<AppointmentFullResponseDto[]> => {
  const { data } = await apiTurnos.get<AppointmentFullResponseDto[]>(
    `appointments/doctor/${doctorId}/today`
  );
  return data;
};

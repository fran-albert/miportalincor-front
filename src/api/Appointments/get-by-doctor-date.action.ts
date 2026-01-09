import { apiTurnos } from "@/services/axiosConfig";
import { AppointmentFullResponseDto } from "@/types/Appointment/Appointment";

export const getAppointmentsByDoctorAndDate = async (
  doctorId: number,
  date: string
): Promise<AppointmentFullResponseDto[]> => {
  const { data } = await apiTurnos.get<AppointmentFullResponseDto[]>(
    `appointments/doctor/${doctorId}/${date}`
  );
  return data;
};

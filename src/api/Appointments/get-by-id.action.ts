import { apiTurnos } from "@/services/axiosConfig";
import { AppointmentFullResponseDto } from "@/types/Appointment/Appointment";

export const getAppointmentById = async (id: number): Promise<AppointmentFullResponseDto> => {
  const { data } = await apiTurnos.get<AppointmentFullResponseDto>(`appointments/${id}`);
  return data;
};

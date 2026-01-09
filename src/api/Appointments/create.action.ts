import { apiTurnos } from "@/services/axiosConfig";
import { AppointmentResponseDto, CreateAppointmentDto } from "@/types/Appointment/Appointment";

export const createAppointment = async (
  dto: CreateAppointmentDto
): Promise<AppointmentResponseDto> => {
  const { data } = await apiTurnos.post<AppointmentResponseDto>('appointments', dto);
  return data;
};

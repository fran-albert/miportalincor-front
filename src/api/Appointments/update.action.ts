import { apiTurnos } from "@/services/axiosConfig";
import { AppointmentResponseDto, UpdateAppointmentDto } from "@/types/Appointment/Appointment";

export const updateAppointment = async (
  id: number,
  dto: UpdateAppointmentDto
): Promise<AppointmentResponseDto> => {
  const { data } = await apiTurnos.patch<AppointmentResponseDto>(`appointments/${id}`, dto);
  return data;
};

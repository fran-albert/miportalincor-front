import { apiTurnos } from "@/services/axiosConfig";
import {
  AppointmentResponseDto,
  UpdateAppointmentStatusDto,
} from "@/types/Appointment/Appointment";

export const changeAppointmentStatus = async (
  id: number,
  dto: UpdateAppointmentStatusDto
): Promise<AppointmentResponseDto> => {
  const { data } = await apiTurnos.post<AppointmentResponseDto>(
    `appointments/${id}/status`,
    dto
  );
  return data;
};

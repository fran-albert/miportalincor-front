import { apiTurnos } from "@/services/axiosConfig";
import {
  AppointmentResponseDto,
  RescheduleAppointmentDto,
} from "@/types/Appointment/Appointment";

export const rescheduleAppointment = async (
  id: number,
  dto: RescheduleAppointmentDto
): Promise<AppointmentResponseDto> => {
  const { data } = await apiTurnos.post<AppointmentResponseDto>(
    `appointments/${id}/reschedule`,
    dto
  );
  return data;
};

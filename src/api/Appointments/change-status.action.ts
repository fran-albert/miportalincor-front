import { apiTurnos } from "@/services/axiosConfig";
import { AppointmentResponseDto, AppointmentStatus } from "@/types/Appointment/Appointment";

export const changeAppointmentStatus = async (
  id: number,
  status: AppointmentStatus
): Promise<AppointmentResponseDto> => {
  const { data } = await apiTurnos.post<AppointmentResponseDto>(
    `appointments/${id}/status`,
    { status }
  );
  return data;
};

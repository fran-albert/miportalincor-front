import { apiTurnos } from "@/services/axiosConfig";
import { AppointmentResponseDto } from "@/types/Appointment/Appointment";

export interface RequestAppointmentDto {
  doctorId: number;
  date: string;
  hour: string;
  consultationTypeId?: number;
  consultationTypeIds?: number[];
  notes?: string;
}

export const requestAppointment = async (
  dto: RequestAppointmentDto
): Promise<AppointmentResponseDto> => {
  const { data } = await apiTurnos.post<AppointmentResponseDto>(
    "appointments/patient/request",
    dto
  );
  return data;
};

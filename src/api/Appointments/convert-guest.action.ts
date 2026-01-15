import { apiTurnos } from "@/services/axiosConfig";
import { AppointmentResponseDto } from "@/types/Appointment/Appointment";

export interface ConvertGuestDto {
  patientId: number;
}

export const convertGuestToPatient = async (
  appointmentId: number,
  patientId: number
): Promise<AppointmentResponseDto> => {
  const { data } = await apiTurnos.patch<AppointmentResponseDto>(
    `appointments/${appointmentId}/convert-guest`,
    { patientId }
  );
  return data;
};

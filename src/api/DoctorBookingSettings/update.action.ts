import { apiTurnos } from "@/services/axiosConfig";
import {
  UpdateDoctorBookingSettingsDto,
  DoctorBookingSettingsResponseDto
} from "@/types/DoctorBookingSettings";

export const updateDoctorBookingSettings = async (
  doctorId: number,
  dto: UpdateDoctorBookingSettingsDto
): Promise<DoctorBookingSettingsResponseDto> => {
  const { data } = await apiTurnos.put<DoctorBookingSettingsResponseDto>(
    `doctor-booking-settings/doctor/${doctorId}`,
    dto
  );
  return data;
};

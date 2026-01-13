import { apiTurnos } from "@/services/axiosConfig";
import { DoctorBookingSettingsResponseDto } from "@/types/DoctorBookingSettings";

export const getDoctorBookingSettings = async (
  doctorId: number
): Promise<DoctorBookingSettingsResponseDto | null> => {
  try {
    const { data } = await apiTurnos.get<DoctorBookingSettingsResponseDto>(
      `doctor-booking-settings/doctor/${doctorId}`
    );
    return data;
  } catch (error: unknown) {
    // Si no existe configuración, retornamos null en lugar de lanzar error
    if ((error as { response?: { status: number } })?.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

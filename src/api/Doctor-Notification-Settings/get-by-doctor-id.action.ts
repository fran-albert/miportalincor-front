import { apiTurnos } from "@/services/axiosConfig";
import { DoctorNotificationSettings } from "@/types/Doctor-Notification-Settings/DoctorNotificationSettings";

export const getDoctorNotificationSettingsByDoctorId = async (
  doctorId: number
): Promise<DoctorNotificationSettings | null> => {
  try {
    const { data } = await apiTurnos.get<DoctorNotificationSettings>(
      `/doctor-notification-settings/doctor/${doctorId}`
    );
    return data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        return null;
      }
    }
    throw error;
  }
};

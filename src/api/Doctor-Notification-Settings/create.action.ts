import { apiTurnos } from "@/services/axiosConfig";
import {
  DoctorNotificationSettings,
  CreateDoctorNotificationSettingsDto,
} from "@/types/Doctor-Notification-Settings/DoctorNotificationSettings";

export const createDoctorNotificationSettings = async (
  dto: CreateDoctorNotificationSettingsDto
): Promise<DoctorNotificationSettings> => {
  const { data } = await apiTurnos.post<DoctorNotificationSettings>(
    "/doctor-notification-settings",
    dto
  );
  return data;
};

import { apiTurnos } from "@/services/axiosConfig";
import {
  DoctorNotificationSettings,
  UpdateDoctorNotificationSettingsDto,
} from "@/types/Doctor-Notification-Settings/DoctorNotificationSettings";

export const updateDoctorNotificationSettings = async (
  id: number,
  dto: UpdateDoctorNotificationSettingsDto
): Promise<DoctorNotificationSettings> => {
  const { data } = await apiTurnos.patch<DoctorNotificationSettings>(
    `/doctor-notification-settings/${id}`,
    dto
  );
  return data;
};

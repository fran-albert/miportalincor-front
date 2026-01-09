import { apiIncorHC } from "@/services/axiosConfig";
import { DoctorSettings, UpdateDoctorSettingsDto } from "@/types/Doctor-Settings/Doctor-Settings";

export const updateMyDoctorSettings = async (
  dto: UpdateDoctorSettingsDto
): Promise<DoctorSettings> => {
  const { data } = await apiIncorHC.patch<DoctorSettings>(
    `doctor-settings/my-settings`,
    dto
  );
  return data;
};

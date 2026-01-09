import { apiIncorHC } from "@/services/axiosConfig";
import { DoctorSettings } from "@/types/Doctor-Settings/Doctor-Settings";

export const getMyDoctorSettings = async (): Promise<DoctorSettings> => {
  const { data } = await apiIncorHC.get<DoctorSettings>(`doctor-settings/my-settings`);
  return data;
};

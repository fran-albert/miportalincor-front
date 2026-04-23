import { apiIncorHC } from "@/services/axiosConfig";
import type { AuthProfile } from "@/types/Auth/Profile";

export const getMyAuthProfile = async (): Promise<AuthProfile> => {
  const { data } = await apiIncorHC.get<AuthProfile>("/auth/me");
  return data;
};

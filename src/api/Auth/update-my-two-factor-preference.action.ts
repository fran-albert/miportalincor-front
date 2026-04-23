import { apiIncorHC } from "@/services/axiosConfig";
import type {
  AuthProfile,
  UpdateTwoFactorPreferenceDto,
} from "@/types/Auth/Profile";

export const updateMyTwoFactorPreference = async (
  dto: UpdateTwoFactorPreferenceDto,
): Promise<AuthProfile> => {
  const { data } = await apiIncorHC.patch<AuthProfile>(
    "/auth/me/two-factor-preference",
    dto,
  );
  return data;
};

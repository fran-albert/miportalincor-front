import { apiIncorHC } from "@/services/axiosConfig";

interface ResetPasswordToDniResponse {
  message: string;
}

export const resetPasswordToDni = async (
  userName: string
): Promise<ResetPasswordToDniResponse> => {
  const { data } = await apiIncorHC.post<ResetPasswordToDniResponse>(
    "/auth/reset-password",
    { userName }
  );
  return data;
};

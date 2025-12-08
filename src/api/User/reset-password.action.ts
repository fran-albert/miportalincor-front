import { apiIncorHC } from "@/services/axiosConfig";

interface ResetPasswordDto {
    password: string;
    confirmPassword: string;
    code: string; // token from email link
}

export const resetPassword = async (passwordData: ResetPasswordDto) => {
    const { data } = await apiIncorHC.post(
        `/auth/reset-password-token`,
        {
            token: passwordData.code,
            password: passwordData.password,
            confirmPassword: passwordData.confirmPassword,
        }
    );
    return data;
}

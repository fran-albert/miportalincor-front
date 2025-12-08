import { apiIncorHC } from "@/services/axiosConfig";

interface ChangePasswordDto {
    userId: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export const changePassword = async (password: ChangePasswordDto) => {
    const { data } = await apiIncorHC.post(
        `/auth/change-password`,
        password
    );
    return data;
}

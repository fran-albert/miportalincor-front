import { apiIncor } from "@/services/axiosConfig";

interface ResetPasswordDto {
    password: string;
    confirmPassword: string;
}

export const resetPassword = async (passwordData: ResetPasswordDto) => {
    // await sleep(2);
    const { data } = await apiIncor.post(
        `account/reset/password`,
        passwordData
    );
    return data;
}

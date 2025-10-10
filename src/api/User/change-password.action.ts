import { apiIncor } from "@/services/axiosConfig";

interface ChangePasswordDto {
    userId: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export const changePassword = async (password: ChangePasswordDto) => {
    // await sleep(2);
    const { data } = await apiIncor.post(
        `account/change/password`,
        password
    );
    return data;
}

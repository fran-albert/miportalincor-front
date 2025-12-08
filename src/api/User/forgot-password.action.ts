import { apiIncorHC } from "@/services/axiosConfig";

export const forgotPassword = async (email: string) => {
    const { data } = await apiIncorHC.post(
        `/auth/forgot-password`,
        { email }
    );
    return data;
}

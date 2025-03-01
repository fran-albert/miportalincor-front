import { apiIncor } from "@/services/axiosConfig";

export const forgotPassword = async (email: string) => {
    const { data } = await apiIncor.post(
        `Account/forgot/password?email=${email}`,
        email
    );
    return data;
}

import axiosInstance from "@/services/axiosConfig";

export const forgotPassword = async (email: string) => {
    const { data } = await axiosInstance.post(
        `Account/forgot/password?email=${email}`,
        email
    );
    return data;
}

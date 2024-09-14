import axiosInstance from "@/services/axiosConfig";

export const resetPassword = async (password: any) => {
    // await sleep(2);
    const { data } = await axiosInstance.post(
        `account/reset/password`,
        password
    );
    return data;
}

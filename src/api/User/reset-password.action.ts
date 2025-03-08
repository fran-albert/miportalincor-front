import { apiIncor } from "@/services/axiosConfig";

export const resetPassword = async (password: any) => {
    // await sleep(2);
    const { data } = await apiIncor.post(
        `account/reset/password`,
        password
    );
    return data;
}

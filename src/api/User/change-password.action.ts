import { User } from "@/types/User/User";
import axiosInstance from "@/services/axiosConfig";

export const changePassword = async (password: User) => {
    // await sleep(2);
    const { data } = await axiosInstance.post(
        `account/change/password`,
        password
    );
    return data;
}

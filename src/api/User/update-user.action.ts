import { User } from "@/types/User/User";
import axiosInstance from "@/services/axiosConfig";

export const updateUser = async (user: User, id: number) => {
    // await sleep(2);
    const { data } = await axiosInstance.put(
        `account/${id}`,
        user
    );
    return data;
}

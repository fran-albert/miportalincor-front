import { User } from "@/types/User/User";
import axiosInstance from "@/services/axiosConfig";

export const requestSupport = async (request: User) => {
    // await sleep(2);
    const { data } = await axiosInstance.post<User>(`Account/support`, request);
    return data;
}

import { User } from "@/types/User/User";
import { apiIncor } from "@/services/axiosConfig";

export const requestSupport = async (request: User) => {
    // await sleep(2);
    const { data } = await apiIncor.post<User>(`Account/support`, request);
    return data;
}

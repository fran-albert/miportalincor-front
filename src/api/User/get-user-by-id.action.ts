import { apiIncor } from "@/services/axiosConfig";
import { User } from "@/types/User/User";

export const getUserById = async (id: number) => {
    // await sleep(2);
    const { data } = await apiIncor.get<User>(`Account/${id}`);
    return data;
}

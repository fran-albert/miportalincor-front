import { apiIncorHC } from "@/services/axiosConfig";
import { User } from "@/types/User/User";

export const getUserById = async (userId: string) => {
    const { data } = await apiIncorHC.get<User>(`/users/${userId}`);
    return data;
}

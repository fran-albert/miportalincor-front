import { User } from "@/types/User/User";
import { apiIncorHC } from "@/services/axiosConfig";

export const updateUser = async (user: Partial<User>, userId: string) => {
    const { data } = await apiIncorHC.put(
        `/users/${userId}`,
        user
    );
    return data;
}

import { User } from "@/types/User/User";
import { apiIncor } from "@/services/axiosConfig";

export const updateUser = async (user: User, id: number) => {
    // await sleep(2);
    const { data } = await apiIncor.put(
        `account/${id}`,
        user
    );
    return data;
}

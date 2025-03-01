import { User } from "@/types/User/User";
import { apiIncor } from "@/services/axiosConfig";

export const changePassword = async (password: User) => {
    // await sleep(2);
    const { data } = await apiIncor.post(
        `account/change/password`,
        password
    );
    return data;
}

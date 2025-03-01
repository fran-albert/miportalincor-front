import { sleep } from "@/common/helpers/helpers";
import { User } from "@/types/User/User";
import { apiIncor } from "@/services/axiosConfig";

export const getRegisterBy = async (id: number) => {
    await sleep(2);
    const { data } = await apiIncor.get<User>(`Account/${id}`);
    return data;
}

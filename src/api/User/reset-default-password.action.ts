import { apiIncor } from "@/services/axiosConfig";
import { sleep } from "@/common/helpers/helpers";

export const resetDefaultPassword = async (idUser: number) => {
    await sleep(2);
    const { data } = await apiIncor.post(
        `Account/reset/default/password/${idUser}`,
    );
    return data;
}

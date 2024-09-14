import axiosInstance from "@/services/axiosConfig";
import { sleep } from "@/common/helpers/helpers";

export const resetDefaultPassword = async (idUser: number) => {
    await sleep(2);
    const { data } = await axiosInstance.post(
        `Account/reset/default/password/${idUser}`,
    );
    return data;
}

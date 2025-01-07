import { sleep } from "@/common/helpers/helpers";
import axiosInstance from "@/services/axiosConfig";
import { Unit } from "@/types/Unit/Unit";

export const deleteUnit = async (id: number) => {
    await sleep(2);
    const { data } = await axiosInstance.delete<Unit>(`Unit/${id}`);
    return data;
}

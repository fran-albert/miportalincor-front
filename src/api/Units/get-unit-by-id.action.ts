import { sleep } from "@/common/helpers/helpers";
import axiosInstance from "@/services/axiosConfig";
import { Unit } from "@/types/Unit/Unit";

export const getUnitById = async (id: number) => {
    await sleep(2);
    const { data } = await axiosInstance.get<Unit>(`Unit/${id}`);
    return data;
}

import { sleep } from "@/common/helpers/helpers";
import axiosInstance from "@/services/axiosConfig";
import { Unit } from "@/types/Unit/Unit";

export const createUnit = async (newUnit: Unit) => {
    await sleep(2);
    const { data } = await axiosInstance.post<Unit>(`Unit`, newUnit);
    return data;
}

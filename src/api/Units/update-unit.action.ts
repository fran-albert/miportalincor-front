import { sleep } from "@/common/helpers/helpers";
import axiosInstance from "@/services/axiosConfig";
import { Unit } from "@/types/Unit/Unit";

export const updateUnit = async (id: number, unit: Unit) => {
    await sleep(2);
    const { data } = await axiosInstance.put<Unit>(`Unit/${id}`, unit);
    return data;
}   

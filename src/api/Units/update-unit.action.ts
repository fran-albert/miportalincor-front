import { sleep } from "@/common/helpers/helpers";
import { apiIncor } from "@/services/axiosConfig";
import { Unit } from "@/types/Unit/Unit";

export const updateUnit = async (id: number, unit: Unit) => {
    await sleep(2);
    const { data } = await apiIncor.put<Unit>(`Unit/${id}`, unit);
    return data;
}   

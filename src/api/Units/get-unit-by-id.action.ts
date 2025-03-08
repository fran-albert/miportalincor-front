import { sleep } from "@/common/helpers/helpers";
import { apiIncor } from "@/services/axiosConfig";
import { Unit } from "@/types/Unit/Unit";

export const getUnitById = async (id: number) => {
    await sleep(2);
    const { data } = await apiIncor.get<Unit>(`Unit/${id}`);
    return data;
}

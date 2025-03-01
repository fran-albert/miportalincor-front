import { apiIncor } from "@/services/axiosConfig";
import { Unit } from "@/types/Unit/Unit";

export const getAllUnits = async () => {
    const { data } = await apiIncor.get<Unit[]>(`Unit/all`);
    return data;
}

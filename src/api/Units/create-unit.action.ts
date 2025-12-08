import { apiIncorHC } from "@/services/axiosConfig";
import { Unit } from "@/types/Unit/Unit";

export const createUnit = async (newUnit: Unit) => {
    const { data } = await apiIncorHC.post<Unit>(`unit`, newUnit);
    return data;
}

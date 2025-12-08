import { apiIncorHC } from "@/services/axiosConfig";
import { Unit } from "@/types/Unit/Unit";

export const updateUnit = async (id: number, unit: Unit) => {
    const { data } = await apiIncorHC.put<Unit>(`unit/${id}`, unit);
    return data;
}   

import { apiIncorHC } from "@/services/axiosConfig";
import { Unit } from "@/types/Unit/Unit";

export const getAllUnits = async () => {
    const { data } = await apiIncorHC.get<Unit[]>(`unit`);
    return data;
}

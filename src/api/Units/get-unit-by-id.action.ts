import { apiIncorHC } from "@/services/axiosConfig";
import { Unit } from "@/types/Unit/Unit";

export const getUnitById = async (id: number) => {
    const { data } = await apiIncorHC.get<Unit>(`unit/${id}`);
    return data;
}

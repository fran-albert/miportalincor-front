import axiosInstance from "@/services/axiosConfig";
import { Unit } from "@/types/Unit/Unit";

export const getAllUnits = async () => {
    const { data } = await axiosInstance.get<Unit[]>(`Unit/all`);
    return data;
}

import { apiIncorHC } from "@/services/axiosConfig";

export const deleteUnit = async (id: number) => {
    const { data } = await apiIncorHC.delete(`unit/${id}`);
    return data;
}

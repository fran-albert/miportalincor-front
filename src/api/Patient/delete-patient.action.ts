import { apiIncorHC } from "@/services/axiosConfig";

export const deletePatient = async (id: string) => {
    const { data } = await apiIncorHC.delete(`patient/${id}`);
    return data;
}

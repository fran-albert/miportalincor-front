import { apiIncorHC } from "@/services/axiosConfig";

export const deleteHealthInsurance = async (id: number) => {
    const { data } = await apiIncorHC.delete(`health-insurance/${id}`);
    return data;
}

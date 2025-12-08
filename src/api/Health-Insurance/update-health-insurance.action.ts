import { apiIncorHC } from "@/services/axiosConfig";
import { HealthInsurance } from "@/types/Health-Insurance/Health-Insurance";

export const updateHealthInsurance = async (id: number, healthInsurance: HealthInsurance) => {
    const { data } = await apiIncorHC.put<HealthInsurance>(`health-insurance/${id}`, healthInsurance);
    return data;
}

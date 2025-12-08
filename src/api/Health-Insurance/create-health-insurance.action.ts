import { apiIncorHC } from "@/services/axiosConfig";
import { HealthInsurance } from "@/types/Health-Insurance/Health-Insurance";

export const createHealthInsurance = async (healthInsurance: HealthInsurance) => {
    const { data } = await apiIncorHC.post<HealthInsurance>(`health-insurance`, healthInsurance);
    return data;
}

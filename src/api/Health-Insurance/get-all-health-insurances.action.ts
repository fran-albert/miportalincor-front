import { HealthInsurance } from "@/types/Health-Insurance/Health-Insurance";
import { apiIncorHC } from "@/services/axiosConfig";

export const getHealthInsurances = async (): Promise<HealthInsurance[]> => {
    const { data } = await apiIncorHC.get<HealthInsurance[]>(`health-insurance`);
    return data;
}

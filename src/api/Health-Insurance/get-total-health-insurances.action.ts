import { apiIncorHC } from "@/services/axiosConfig";

export const getTotalHealthInsurances = async (): Promise<number> => {
    const { data } = await apiIncorHC.get(`health-insurance`);
    const totalHealthInsurances = data.length;
    return totalHealthInsurances;
}
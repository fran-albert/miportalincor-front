import { HealthInsurance } from "@/types/Health-Insurance/Health-Insurance";
import axiosInstance from "@/services/axiosConfig";

export const getHealthInsurances = async (): Promise<HealthInsurance[]> => {
    // await sleep(2);

    const { data } = await axiosInstance.get<HealthInsurance[]>(`HealthInsurance/all`);
    return data;
}

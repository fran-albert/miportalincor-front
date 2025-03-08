import { HealthInsurance } from "@/types/Health-Insurance/Health-Insurance";
import { apiIncor } from "@/services/axiosConfig";

export const getHealthInsurances = async (): Promise<HealthInsurance[]> => {
    // await sleep(2);

    const { data } = await apiIncor.get<HealthInsurance[]>(`HealthInsurance/all`);
    return data;
}

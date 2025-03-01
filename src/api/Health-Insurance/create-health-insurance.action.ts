import { sleep } from "@/common/helpers/helpers";
import { apiIncor } from "@/services/axiosConfig";
import { HealthInsurance } from "@/types/Health-Insurance/Health-Insurance";

export const createHealthInsurance = async (healthInsurance: HealthInsurance) => {
    await sleep(2);
    const { data } = await apiIncor.post<HealthInsurance>(`/HealthInsurance/create`, healthInsurance);
    return data;
}

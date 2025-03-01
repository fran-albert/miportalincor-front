import { sleep } from "@/common/helpers/helpers";
import { apiIncor } from "@/services/axiosConfig";
import { HealthInsurance } from "@/types/Health-Insurance/Health-Insurance";

export const updateHealthInsurance = async (id: number, healthInsurance: HealthInsurance) => {
    await sleep(2);
    const { data } = await apiIncor.put<HealthInsurance>(`HealthInsurance/${id}`, healthInsurance);
    return data;
}

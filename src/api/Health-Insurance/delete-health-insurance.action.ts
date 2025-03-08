import { sleep } from "@/common/helpers/helpers";
import { apiIncor } from "@/services/axiosConfig";
import { HealthInsurance } from "@/types/Health-Insurance/Health-Insurance";

export const deleteHealthInsurance = async (id: number) => {
    await sleep(2);
    const { data } = await apiIncor.delete<HealthInsurance>(`HealthInsurance/${id}`);
    return data;
}

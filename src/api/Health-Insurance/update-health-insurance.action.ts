import { sleep } from "@/common/helpers/helpers";
import axiosInstance from "@/services/axiosConfig";
import { HealthInsurance } from "@/types/Health-Insurance/Health-Insurance";

export const updateHealthInsurance = async (id: number, healthInsurance: HealthInsurance) => {
    await sleep(2);
    const { data } = await axiosInstance.put<HealthInsurance>(`HealthInsurance/${id}`, healthInsurance);
    return data;
}

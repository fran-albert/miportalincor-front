import { sleep } from "@/common/helpers/helpers";
import axiosInstance from "@/services/axiosConfig";
import { HealthInsurance } from "@/types/Health-Insurance/Health-Insurance";

export const createHealthInsurance = async (healthInsurance: HealthInsurance) => {
    await sleep(2);
    const { data } = await axiosInstance.post<HealthInsurance>(`/HealthInsurance/create`, healthInsurance);
    return data;
}

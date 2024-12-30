import { sleep } from "@/common/helpers/helpers";
import axiosInstance from "@/services/axiosConfig";
import { BloodTestDataRequest } from "@/types/Blod-Test-Data/Blod-Test-Data";

export const createBlodTestData = async (newBlodTestData: BloodTestDataRequest) => {
    await sleep(2);
    const { data } = await axiosInstance.post<BloodTestDataRequest>(`BloodTestData/create`, newBlodTestData);
    return data;
}

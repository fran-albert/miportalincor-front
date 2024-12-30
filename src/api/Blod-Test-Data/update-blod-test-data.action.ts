import { sleep } from "@/common/helpers/helpers";
import axiosInstance from "@/services/axiosConfig";
import { BloodTest } from "@/types/Blod-Test/Blod-Test";

export const updateBlodTest = async (id: number, newBlodTest: BloodTest) => {
    await sleep(2);
    const { data } = await axiosInstance.put<BloodTest>(`BloodTest/${id}`, newBlodTest);
    return data;
}

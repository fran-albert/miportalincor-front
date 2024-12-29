import { sleep } from "@/common/helpers/helpers";
import axiosInstance from "@/services/axiosConfig";
import { BloodTest } from "@/types/Blod-Test/Blod-Test";

export const deleteBlodTest = async (id: number) => {
    await sleep(2);
    const { data } = await axiosInstance.delete<BloodTest>(`BloodTest/${id}`);
    return data;
}

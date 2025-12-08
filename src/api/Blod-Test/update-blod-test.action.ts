import { apiIncorHC } from "@/services/axiosConfig";
import { BloodTest } from "@/types/Blod-Test/Blod-Test";

export const updateBlodTest = async (id: number, newBlodTest: BloodTest) => {
    const { data } = await apiIncorHC.put<BloodTest>(`blood-test/${id}`, newBlodTest);
    return data;
}

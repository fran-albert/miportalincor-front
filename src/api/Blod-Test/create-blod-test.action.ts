import { apiIncorHC } from "@/services/axiosConfig";
import { BloodTest } from "@/types/Blod-Test/Blod-Test";

export const createBlodTest = async (newBlodTest: BloodTest) => {
    const { data } = await apiIncorHC.post<BloodTest>(`blood-test`, newBlodTest);
    return data;
}

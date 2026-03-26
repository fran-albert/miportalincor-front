import { apiIncorHC } from "@/services/axiosConfig";
import { BloodTest, BloodTestMutationPayload } from "@/types/Blod-Test/Blod-Test";

export const createBlodTest = async (newBlodTest: BloodTestMutationPayload) => {
    const { data } = await apiIncorHC.post<BloodTest>(`blood-test`, newBlodTest);
    return data;
}

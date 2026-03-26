import { apiIncorHC } from "@/services/axiosConfig";
import { BloodTest, BloodTestMutationPayload } from "@/types/Blod-Test/Blod-Test";

export const updateBlodTest = async (id: number, newBlodTest: BloodTestMutationPayload) => {
    const { data } = await apiIncorHC.put<BloodTest>(`blood-test/${id}`, newBlodTest);
    return data;
}

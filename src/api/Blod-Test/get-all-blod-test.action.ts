import { BloodTest } from "@/types/Blod-Test/Blod-Test";
import { apiIncorHC } from "@/services/axiosConfig";

export const getBlodTests = async (): Promise<BloodTest[]> => {
    const { data } = await apiIncorHC.get<BloodTest[]>(`blood-test`);
    return data;
}

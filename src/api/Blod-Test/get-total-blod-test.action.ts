import { apiIncorHC } from "@/services/axiosConfig";

export const getTotalBlodTests = async (): Promise<number> => {
    const { data } = await apiIncorHC.get(`blood-test`);
    const totalBlodTests = data.length;
    return totalBlodTests;
}
import { apiIncorHC } from "@/services/axiosConfig";
import { BloodTestDataRequest } from "@/types/Blod-Test-Data/Blod-Test-Data";

export const createBlodTestData = async (newBlodTestData: BloodTestDataRequest) => {
    const { data } = await apiIncorHC.post<{ studyId: string; bloodTestData: unknown[] }>(`blood-test-data/create`, newBlodTestData);
    return data;
}

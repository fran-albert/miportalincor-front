import { BloodTest } from "@/types/Blod-Test/Blod-Test";
import { apiIncor } from "@/services/axiosConfig";

export const getBlodTests = async (): Promise<BloodTest[]> => {
    // await sleep(2);
    const { data } = await apiIncor.get<BloodTest[]>(`BloodTest/all`);
    return data
}

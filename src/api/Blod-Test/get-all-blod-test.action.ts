import { BloodTest } from "@/types/Blod-Test/Blod-Test";
import axiosInstance from "@/services/axiosConfig";

export const getBlodTests = async (): Promise<BloodTest[]> => {
    // await sleep(2);
    const { data } = await axiosInstance.get<BloodTest[]>(`BloodTest/all`);
    return data
}

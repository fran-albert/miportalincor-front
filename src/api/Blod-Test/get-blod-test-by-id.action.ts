import { apiIncorHC } from "@/services/axiosConfig";
import { BloodTest } from "@/types/Blod-Test/Blod-Test";

export const getBlodTestById = async (id: number) => {
    const { data } = await apiIncorHC.get<BloodTest>(`blood-test/${id}`);
    return data;
}

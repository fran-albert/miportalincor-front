import { apiLaboral } from "@/services/axiosConfig";

export const getCompanyCount = async (): Promise<number> => {
    const { data } = await apiLaboral.get<number>(`company/count`);
    return data;
}
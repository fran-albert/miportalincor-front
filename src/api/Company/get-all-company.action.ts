import { apiLaboral } from "@/services/axiosConfig";
import { Company } from "@/types/Company/Company";

export const getAllCompany = async (): Promise<Company[]> => {
    // await sleep(2);
    const { data } = await apiLaboral.get<Company[]>(`company`);
    return data
}

import { sleep } from "@/common/helpers/helpers";
import { apiLaboral } from "@/services/axiosConfig";
import { Company } from "@/types/Company/Company";

export const getCompanyById = async (id: number) => {
    await sleep(2);
    const { data } = await apiLaboral.get<Company>(`company/${id}`);
    return data;
}

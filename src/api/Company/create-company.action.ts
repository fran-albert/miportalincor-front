import { sleep } from "@/common/helpers/helpers";
import { apiLaboral } from "@/services/axiosConfig";
import { Company, CreateCompanyDto } from "@/types/Company/Company";

export const createCompany = async (values: CreateCompanyDto) => {
    await sleep(2);
    const { data } = await apiLaboral.post<Company>(`company`, values);
    return data;
}

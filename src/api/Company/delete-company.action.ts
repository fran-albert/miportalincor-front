import { sleep } from "@/common/helpers/helpers";
import { apiLaboral } from "@/services/axiosConfig";

export const deleteCompany = async (id: number) => {
    await sleep(2);
    const { data } = await apiLaboral.delete<void>(`company/${id}`);
    return data;
}

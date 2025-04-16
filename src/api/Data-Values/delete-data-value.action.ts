import { sleep } from "@/common/helpers/helpers";
import { apiLaboral } from "@/services/axiosConfig";

export const deleteDataValue = async (id: number): Promise<void> => {
    await sleep(2);
    const { data } = await apiLaboral.delete<void>(`data-values/${id}`);
    return data;
}

import { sleep } from "@/common/helpers/helpers";
import { apiIncorHC } from "@/services/axiosConfig";

export const deleteStudy = async (id: string) => {
    await sleep(2);
    const { data } = await apiIncorHC.delete<{ success: boolean; message: string }>(`study/${id}`);
    return data;
}

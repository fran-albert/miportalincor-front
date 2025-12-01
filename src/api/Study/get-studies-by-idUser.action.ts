import { apiIncorHC } from "@/services/axiosConfig";
import { sleep } from "@/common/helpers/helpers";
import { Study } from "@/types/Study/Study";

export const getStudiesByUserId = async (id: string | number) => {
    await sleep(2);
    const { data } = await apiIncorHC.get<Study[]>(`study/byUser/${id}`);
    return data;
}

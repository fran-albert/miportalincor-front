import { apiIncor } from "@/services/axiosConfig";
import { sleep } from "@/common/helpers/helpers";
import { Study } from "@/types/Study/Study";

export const getStudiesByUserId = async (id: number) => {
    await sleep(2);
    const { data } = await apiIncor.get<Study[]>(`Study/byUser/${id}`);
    return data;
}

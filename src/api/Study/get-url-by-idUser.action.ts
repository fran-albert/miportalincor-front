import { apiIncorHC } from "@/services/axiosConfig";
import { sleep } from "@/common/helpers/helpers";

export const getUrlByUserId = async (id: string | number, locationS3: string) => {
    await sleep(2);
    const { data } = await apiIncorHC.get<string>(`study/getUrl/${id}?fileName=${locationS3}`);
    return data;
}

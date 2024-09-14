import axiosInstance from "@/services/axiosConfig";
import { sleep } from "@/common/helpers/helpers";

export const getUrlByUserId = async (id: number, locationS3: string) => {
    await sleep(2);
    const { data } = await axiosInstance.get<string>(`Study/getUrl/${id}?fileName=${locationS3}`);
    return data;
}

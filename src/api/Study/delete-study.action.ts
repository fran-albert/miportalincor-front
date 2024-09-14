import { sleep } from "@/common/helpers/helpers";
import { Study } from "@/types/Study/Study";
import axiosInstance from "@/services/axiosConfig";

export const deleteStudy = async (id: number) => {
    await sleep(2);
    const { data } = await axiosInstance.delete<Study>(`Study/${id}`);
    return data;
}

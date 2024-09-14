import axiosInstance from "@/services/axiosConfig";
import { sleep } from "@/common/helpers/helpers";
import { Study } from "@/types/Study/Study";

export const getAllStudyType = async () => {
    await sleep(2);
    const { data } = await axiosInstance.get<Study[]>("StudyType/all");
    return data;
}

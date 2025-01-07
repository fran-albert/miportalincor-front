import { sleep } from "@/common/helpers/helpers";
import axiosInstance from "@/services/axiosConfig";
import { StudyType } from "@/types/Study-Type/Study-Type";

export const createStudyType = async (newStudyType: StudyType) => {
    await sleep(2);
    const { data } = await axiosInstance.post<StudyType>(`/StudyType/create`, newStudyType);
    return data;
}

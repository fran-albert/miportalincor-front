import { sleep } from "@/common/helpers/helpers";
import { apiIncorHC } from "@/services/axiosConfig";
import { StudyType } from "@/types/Study-Type/Study-Type";

export const createStudyType = async (newStudyType: { name: string }) => {
    await sleep(2);
    const { data } = await apiIncorHC.post<StudyType>(`study-type`, newStudyType);
    return data;
}

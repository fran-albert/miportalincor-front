import { sleep } from "@/common/helpers/helpers";
import { apiIncor } from "@/services/axiosConfig";
import { StudyType } from "@/types/Study-Type/Study-Type";

export const updateStudyType = async (id: number, newStudyType: StudyType) => {
    await sleep(2);
    const { data } = await apiIncor.put<StudyType>(`StudyType/${id}`, newStudyType);
    return data;
}

import { sleep } from "@/common/helpers/helpers";
import { apiIncor } from "@/services/axiosConfig";
import { StudyType } from "@/types/Study-Type/Study-Type";

export const createStudyType = async (newStudyType: StudyType) => {
    await sleep(2);
    const { data } = await apiIncor.post<StudyType>(`/StudyType/create`, newStudyType);
    return data;
}

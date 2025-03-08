import { sleep } from "@/common/helpers/helpers";
import { apiIncor } from "@/services/axiosConfig";
import { StudyType } from "@/types/Study-Type/Study-Type";

export const deleteStudyType = async (id: number) => {
    await sleep(2);
    const { data } = await apiIncor.delete<StudyType>(`StudyType/${id}`);
    return data;
}

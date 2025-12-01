import { sleep } from "@/common/helpers/helpers";
import { apiIncorHC } from "@/services/axiosConfig";
import { StudyType } from "@/types/Study-Type/Study-Type";

export const updateStudyType = async (id: number, newStudyType: { name: string }) => {
    await sleep(2);
    const { data } = await apiIncorHC.put<StudyType>(`study-type/${id}`, newStudyType);
    return data;
}

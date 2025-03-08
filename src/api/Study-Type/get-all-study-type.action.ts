import { apiIncor } from "@/services/axiosConfig";
import { StudyType } from "@/types/Study-Type/Study-Type";

export const getAllStudyType = async () => {
    const { data } = await apiIncor.get<StudyType[]>("StudyType/all");
    return data;
}

import { apiIncorHC } from "@/services/axiosConfig";
import { StudyType } from "@/types/Study-Type/Study-Type";

export const getAllStudyType = async () => {
    const { data } = await apiIncorHC.get<StudyType[]>("study-type/all");
    return data;
}

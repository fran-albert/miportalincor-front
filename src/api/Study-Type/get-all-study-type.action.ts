import axiosInstance from "@/services/axiosConfig";
import { StudyType } from "@/types/Study-Type/Study-Type";

export const getAllStudyType = async () => {
    const { data } = await axiosInstance.get<StudyType[]>("StudyType/all");
    return data;
}

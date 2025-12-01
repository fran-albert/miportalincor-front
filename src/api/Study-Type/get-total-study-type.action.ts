import { apiIncorHC } from "@/services/axiosConfig";

export const getTotalStudyTypes = async (): Promise<number> => {
    const { data } = await apiIncorHC.get(`study-type/all`);
    const totalStudyTypes = data.length;
    return totalStudyTypes;
}
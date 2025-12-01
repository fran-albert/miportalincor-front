import { apiIncorHC } from "@/services/axiosConfig";

export const getLastStudies = async (studyTypeId?: number): Promise<number> => {
    let url = 'study/lastStudies';
    if (studyTypeId) {
        url += `?studyTypeId=${studyTypeId}`;
    }

    const { data } = await apiIncorHC.get(url);
    return data;
}
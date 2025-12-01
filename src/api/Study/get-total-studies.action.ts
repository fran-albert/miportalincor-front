import { apiIncorHC } from "@/services/axiosConfig";

export const getTotalStudies = async (studyTypeId?: number): Promise<number> => {
    let url = 'study/all';
    if (studyTypeId) {
        url += `?studyTypeId=${studyTypeId}`;
    }

    const { data } = await apiIncorHC.get(url);
    return data;
}

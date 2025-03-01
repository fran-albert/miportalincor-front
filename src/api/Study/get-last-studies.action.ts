import { apiIncor } from "@/services/axiosConfig";

export const getLastStudies = async (studyTypeId?: number): Promise<number> => {
    let url = 'study/lastStudies';
    if (studyTypeId) {
        url += `?studyTypeId=${studyTypeId}`;
    }

    const { data } = await apiIncor.get(url);
    return data;


}
import { apiIncor } from "@/services/axiosConfig";

export const getTotalStudyTypes = async (): Promise<number> => {
    // await sleep(2);

    const { data } = await apiIncor.get(`StudyType/all`);
    const totalStudyTypes = data.length;
    return totalStudyTypes;
}
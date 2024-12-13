import axiosInstance from "@/services/axiosConfig";

export const getTotalStudyTypes = async (): Promise<number> => {
    // await sleep(2);

    const { data } = await axiosInstance.get(`StudyType/all`);
    const totalStudyTypes = data.length;
    return totalStudyTypes;
}
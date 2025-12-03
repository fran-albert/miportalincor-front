import { apiIncorHC } from "@/services/axiosConfig";
import { StudiesWithURL } from "@/types/Study/Study";

export const getStudiesWithUrls = async (userId: string | number): Promise<StudiesWithURL[]> => {
    const { data } = await apiIncorHC.get<StudiesWithURL[]>(`study/byUserWithUrls/${userId}`);
    return data;
};

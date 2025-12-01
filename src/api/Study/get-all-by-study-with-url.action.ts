import { apiIncorHC } from "@/services/axiosConfig";
import { StudiesWithURL } from "@/types/Study/Study";

export const getAllStudyWithUrl = async (userId: string | number) => {
  const { data } = await apiIncorHC.get<StudiesWithURL[]>(`study/byUserWithUrls/${userId}`);
  return data;
};


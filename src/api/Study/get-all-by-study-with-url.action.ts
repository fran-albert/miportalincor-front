import { apiIncor } from "@/services/axiosConfig";
import { StudiesWithURL } from "@/types/Study/Study";

export const getAllStudyWithUrl = async (userId: number) => {
  const { data } = await apiIncor.get<StudiesWithURL[]>(`Study/byUserWithUrls/${userId}`);
  return data;
};


import { apiIncorHC } from "@/services/axiosConfig";
import { Program } from "@/types/Program/Program";

export const getPrograms = async (): Promise<Program[]> => {
  const { data } = await apiIncorHC.get<Program[]>("/programs");
  return data;
};

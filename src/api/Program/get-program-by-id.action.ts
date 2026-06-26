import { apiIncorHC } from "@/services/axiosConfig";
import { Program } from "@/types/Program/Program";

export const getProgramById = async (id: string): Promise<Program> => {
  const { data } = await apiIncorHC.get<Program>(`/programs/${id}`);
  return data;
};

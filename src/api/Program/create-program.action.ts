import { apiIncorHC } from "@/services/axiosConfig";
import { CreateProgramDto, Program } from "@/types/Program/Program";

export const createProgram = async (dto: CreateProgramDto): Promise<Program> => {
  const { data } = await apiIncorHC.post<Program>("/programs", dto);
  return data;
};

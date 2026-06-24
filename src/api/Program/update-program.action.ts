import { apiIncorHC } from "@/services/axiosConfig";
import { UpdateProgramDto, Program } from "@/types/Program/Program";

export const updateProgram = async (
  id: string,
  dto: UpdateProgramDto
): Promise<Program> => {
  const { data } = await apiIncorHC.put<Program>(`/programs/${id}`, dto);
  return data;
};

import { apiIncorHC } from "@/services/axiosConfig";
import { AddMemberDto, ProgramMember } from "@/types/Program/ProgramMember";

export const addProgramMember = async (
  programId: string,
  dto: AddMemberDto
): Promise<ProgramMember> => {
  const { data } = await apiIncorHC.post<ProgramMember>(
    `/programs/${programId}/members`,
    dto
  );
  return data;
};

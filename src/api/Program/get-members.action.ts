import { apiIncorHC } from "@/services/axiosConfig";
import { ProgramMember } from "@/types/Program/ProgramMember";

export const getProgramMembers = async (
  programId: string
): Promise<ProgramMember[]> => {
  const { data } = await apiIncorHC.get<ProgramMember[]>(
    `/programs/${programId}/members`
  );
  return data;
};

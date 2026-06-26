import { apiIncorHC } from "@/services/axiosConfig";

export const removeProgramMember = async (
  programId: string,
  memberId: string
): Promise<void> => {
  await apiIncorHC.delete(`/programs/${programId}/members/${memberId}`);
};

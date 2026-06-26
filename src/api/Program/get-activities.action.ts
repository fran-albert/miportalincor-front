import { apiIncorHC } from "@/services/axiosConfig";
import { ProgramActivity } from "@/types/Program/ProgramActivity";

export const getProgramActivities = async (
  programId: string
): Promise<ProgramActivity[]> => {
  const { data } = await apiIncorHC.get<ProgramActivity[]>(
    `/programs/${programId}/activities`
  );
  return data;
};

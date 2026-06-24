import { apiIncorHC } from "@/services/axiosConfig";
import { ProgramFollowUpEntry } from "@/types/Program/ProgramFollowUp";

export const getFollowUpEntries = async (
  enrollmentId: string
): Promise<ProgramFollowUpEntry[]> => {
  const { data } = await apiIncorHC.get<ProgramFollowUpEntry[]>(
    `/enrollments/${enrollmentId}/follow-up`
  );
  return data;
};

import { apiIncorHC } from "@/services/axiosConfig";
import {
  ProgramFollowUpEntry,
  UpdateFollowUpNoteDto,
} from "@/types/Program/ProgramFollowUp";

export const updateFollowUpNote = async (
  enrollmentId: string,
  entryId: string,
  dto: UpdateFollowUpNoteDto
): Promise<ProgramFollowUpEntry> => {
  const { data } = await apiIncorHC.put<ProgramFollowUpEntry>(
    `/enrollments/${enrollmentId}/follow-up/${entryId}`,
    dto
  );
  return data;
};

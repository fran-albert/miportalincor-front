import { apiIncorHC } from "@/services/axiosConfig";
import {
  CreateFollowUpNoteDto,
  ProgramFollowUpEntry,
} from "@/types/Program/ProgramFollowUp";

export const createFollowUpNote = async (
  enrollmentId: string,
  dto: CreateFollowUpNoteDto
): Promise<ProgramFollowUpEntry> => {
  const { data } = await apiIncorHC.post<ProgramFollowUpEntry>(
    `/enrollments/${enrollmentId}/follow-up/notes`,
    dto
  );
  return data;
};

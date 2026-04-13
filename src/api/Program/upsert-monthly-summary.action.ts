import { apiIncorHC } from "@/services/axiosConfig";
import {
  ProgramFollowUpEntry,
  UpsertMonthlySummaryDto,
} from "@/types/Program/ProgramFollowUp";

export const upsertMonthlySummary = async (
  enrollmentId: string,
  year: number,
  month: number,
  dto: UpsertMonthlySummaryDto
): Promise<ProgramFollowUpEntry> => {
  const { data } = await apiIncorHC.put<ProgramFollowUpEntry>(
    `/enrollments/${enrollmentId}/monthly-summary/${year}/${month}`,
    dto
  );
  return data;
};

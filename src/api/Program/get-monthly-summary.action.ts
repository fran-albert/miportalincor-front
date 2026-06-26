import { apiIncorHC } from "@/services/axiosConfig";
import { ProgramMonthlySummaryDetail } from "@/types/Program/ProgramFollowUp";

export const getMonthlySummary = async (
  enrollmentId: string,
  year: number,
  month: number
): Promise<ProgramMonthlySummaryDetail> => {
  const { data } = await apiIncorHC.get<ProgramMonthlySummaryDetail>(
    `/enrollments/${enrollmentId}/monthly-summary/${year}/${month}`
  );
  return data;
};

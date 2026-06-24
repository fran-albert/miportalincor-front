import { apiIncorHC } from "@/services/axiosConfig";
import type { PrescriptionReportWeeklyTrend } from "@/types/Prescription-Reports/Prescription-Reports";

export const getPrescriptionReportWeeklyTrend = async (
  from: string,
  to: string
): Promise<PrescriptionReportWeeklyTrend[]> => {
  const { data } = await apiIncorHC.get<PrescriptionReportWeeklyTrend[]>(
    `prescription-requests/reports/weekly-trend`,
    { params: { from, to } }
  );
  return data;
};

import { apiIncorHC } from "@/services/axiosConfig";
import type { PrescriptionReportSummary } from "@/types/Prescription-Reports/Prescription-Reports";

export const getPrescriptionReportSummary = async (
  from: string,
  to: string
): Promise<PrescriptionReportSummary> => {
  const { data } = await apiIncorHC.get<PrescriptionReportSummary>(
    `prescription-requests/reports/summary`,
    { params: { from, to } }
  );
  return data;
};

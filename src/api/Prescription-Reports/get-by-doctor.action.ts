import { apiIncorHC } from "@/services/axiosConfig";
import type { PrescriptionReportByDoctor } from "@/types/Prescription-Reports/Prescription-Reports";

export const getPrescriptionReportByDoctor = async (
  from: string,
  to: string
): Promise<PrescriptionReportByDoctor[]> => {
  const { data } = await apiIncorHC.get<PrescriptionReportByDoctor[]>(
    `prescription-requests/reports/by-doctor`,
    { params: { from, to } }
  );
  return data;
};

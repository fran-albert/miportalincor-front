import { apiIncorHC } from "@/services/axiosConfig";
import { ComplianceResponse } from "@/types/Program/Attendance";

export const getCompliance = async (
  enrollmentId: string,
  from: string,
  to: string
): Promise<ComplianceResponse> => {
  const { data } = await apiIncorHC.get<ComplianceResponse>(
    `/attendance/enrollment/${enrollmentId}/compliance`,
    { params: { from, to } }
  );
  return data;
};

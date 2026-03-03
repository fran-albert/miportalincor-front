import { apiIncorHC } from "@/services/axiosConfig";
import { PlanVersionResponse } from "@/types/Program/ProgramPlan";

export const getPlanVersions = async (
  enrollmentId: string
): Promise<PlanVersionResponse[]> => {
  const { data } = await apiIncorHC.get<PlanVersionResponse[]>(
    `/enrollments/${enrollmentId}/plans`
  );
  return data;
};

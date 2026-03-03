import { apiIncorHC } from "@/services/axiosConfig";
import {
  CreatePlanVersionDto,
  PlanVersionResponse,
} from "@/types/Program/ProgramPlan";

export const createPlanVersion = async (
  enrollmentId: string,
  dto: CreatePlanVersionDto
): Promise<PlanVersionResponse> => {
  const { data } = await apiIncorHC.post<PlanVersionResponse>(
    `/enrollments/${enrollmentId}/plans`,
    dto
  );
  return data;
};

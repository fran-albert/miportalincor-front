import { AxiosError } from "axios";
import { apiIncorHC } from "@/services/axiosConfig";
import { PlanVersionResponse } from "@/types/Program/ProgramPlan";

export const getCurrentPlan = async (
  enrollmentId: string
): Promise<PlanVersionResponse | null> => {
  try {
    const { data } = await apiIncorHC.get<PlanVersionResponse>(
      `/enrollments/${enrollmentId}/plans/current`
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

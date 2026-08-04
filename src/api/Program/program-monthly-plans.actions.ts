import { apiIncorHC } from "@/services/axiosConfig";
import { validateProgramMonthlyPlanMoney } from "@/common/helpers/programMoney";
import {
  ProgramMonthlyPlan,
  UpsertProgramMonthlyPlanDto,
} from "@/types/Program/ProgramMonthlyPlan";

export const getProgramMonthlyPlan = async (
  enrollmentId: string,
  year: number,
  month: number
): Promise<ProgramMonthlyPlan> => {
  const { data } = await apiIncorHC.get<ProgramMonthlyPlan>(
    `/enrollments/${enrollmentId}/monthly-plans/${year}/${month}`
  );
  return validateProgramMonthlyPlanMoney(data);
};

export const getProgramMonthlyPlans = async (
  enrollmentId: string,
  year?: number
): Promise<ProgramMonthlyPlan[]> => {
  const { data } = await apiIncorHC.get<ProgramMonthlyPlan[]>(
    `/enrollments/${enrollmentId}/monthly-plans`,
    { params: year === undefined ? undefined : { year } }
  );
  return data.map(validateProgramMonthlyPlanMoney);
};

export const upsertProgramMonthlyPlan = async (
  enrollmentId: string,
  year: number,
  month: number,
  dto: UpsertProgramMonthlyPlanDto
): Promise<ProgramMonthlyPlan> => {
  const { data } = await apiIncorHC.put<ProgramMonthlyPlan>(
    `/enrollments/${enrollmentId}/monthly-plans/${year}/${month}`,
    dto
  );
  return validateProgramMonthlyPlanMoney(data);
};

export const sendProgramMonthlyPlanWhatsapp = async (
  enrollmentId: string,
  year: number,
  month: number
): Promise<ProgramMonthlyPlan> => {
  const { data } = await apiIncorHC.post<ProgramMonthlyPlan>(
    `/enrollments/${enrollmentId}/monthly-plans/${year}/${month}/whatsapp`
  );
  return validateProgramMonthlyPlanMoney(data);
};

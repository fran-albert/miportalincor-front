import { apiIncorHC } from "@/services/axiosConfig";
import {
  UpdateActivityDto,
  ProgramActivity,
} from "@/types/Program/ProgramActivity";
import { validateOptionalActivityPrice } from "@/common/helpers/programMoney";

export const updateProgramActivity = async (
  programId: string,
  activityId: string,
  dto: UpdateActivityDto
): Promise<ProgramActivity> => {
  const { data } = await apiIncorHC.put<ProgramActivity>(
    `/programs/${programId}/activities/${activityId}`,
    dto
  );
  return validateOptionalActivityPrice(data);
};

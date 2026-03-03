import { apiIncorHC } from "@/services/axiosConfig";
import {
  UpdateActivityDto,
  ProgramActivity,
} from "@/types/Program/ProgramActivity";

export const updateProgramActivity = async (
  programId: string,
  activityId: string,
  dto: UpdateActivityDto
): Promise<ProgramActivity> => {
  const { data } = await apiIncorHC.put<ProgramActivity>(
    `/programs/${programId}/activities/${activityId}`,
    dto
  );
  return data;
};

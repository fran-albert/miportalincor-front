import { apiIncorHC } from "@/services/axiosConfig";
import {
  CreateActivityDto,
  ProgramActivity,
} from "@/types/Program/ProgramActivity";

export const createProgramActivity = async (
  programId: string,
  dto: CreateActivityDto
): Promise<ProgramActivity> => {
  const { data } = await apiIncorHC.post<ProgramActivity>(
    `/programs/${programId}/activities`,
    dto
  );
  return data;
};

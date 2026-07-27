import { apiIncorHC } from "@/services/axiosConfig";
import {
  ProgramPricing,
  UpdateProgramPricingDto,
} from "@/types/Program/Program";

export const getProgramPricing = async (
  programId: string
): Promise<ProgramPricing> => {
  const { data } = await apiIncorHC.get<ProgramPricing>(
    `/programs/${programId}/pricing`
  );
  return data;
};

export const updateProgramPricing = async (
  programId: string,
  dto: UpdateProgramPricingDto
): Promise<ProgramPricing> => {
  const { data } = await apiIncorHC.patch<ProgramPricing>(
    `/programs/${programId}/pricing`,
    dto
  );
  return data;
};

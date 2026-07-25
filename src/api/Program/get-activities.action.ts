import { apiIncorHC } from "@/services/axiosConfig";
import { ProgramActivity } from "@/types/Program/ProgramActivity";
import { validateOptionalActivityPrice } from "@/common/helpers/programMoney";

export const getProgramActivities = async (
  programId: string
): Promise<ProgramActivity[]> => {
  const { data } = await apiIncorHC.get<ProgramActivity[]>(
    `/programs/${programId}/activities`
  );
  return data.map(validateOptionalActivityPrice);
};

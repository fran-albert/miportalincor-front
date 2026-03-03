import { apiIncorHC } from "@/services/axiosConfig";
import { ProgramEnrollment } from "@/types/Program/ProgramEnrollment";

export const getProgramEnrollments = async (
  programId: string
): Promise<ProgramEnrollment[]> => {
  const { data } = await apiIncorHC.get<ProgramEnrollment[]>(
    `/programs/${programId}/enrollments`
  );
  return data;
};

import { apiIncorHC } from "@/services/axiosConfig";
import { ProgramEnrollment } from "@/types/Program/ProgramEnrollment";

export const getMyEnrollments = async (): Promise<ProgramEnrollment[]> => {
  const { data } = await apiIncorHC.get<ProgramEnrollment[]>(
    "/enrollments/my"
  );
  return data;
};

import { apiIncorHC } from "@/services/axiosConfig";
import { ProgramEnrollment } from "@/types/Program/ProgramEnrollment";

export const getEnrollmentById = async (
  programId: string,
  enrollmentId: string
): Promise<ProgramEnrollment> => {
  const { data } = await apiIncorHC.get<ProgramEnrollment>(
    `/programs/${programId}/enrollments/${enrollmentId}`
  );
  return data;
};

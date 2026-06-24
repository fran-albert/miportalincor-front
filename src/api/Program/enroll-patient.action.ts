import { apiIncorHC } from "@/services/axiosConfig";
import {
  EnrollPatientDto,
  ProgramEnrollment,
} from "@/types/Program/ProgramEnrollment";

export const enrollPatient = async (
  programId: string,
  dto: EnrollPatientDto
): Promise<ProgramEnrollment> => {
  const { data } = await apiIncorHC.post<ProgramEnrollment>(
    `/programs/${programId}/enrollments`,
    dto
  );
  return data;
};

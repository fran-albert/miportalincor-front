import { apiIncorHC } from "@/services/axiosConfig";
import {
  UpdateEnrollmentStatusDto,
  ProgramEnrollment,
} from "@/types/Program/ProgramEnrollment";

export const updateEnrollmentStatus = async (
  programId: string,
  enrollmentId: string,
  dto: UpdateEnrollmentStatusDto
): Promise<ProgramEnrollment> => {
  const { data } = await apiIncorHC.put<ProgramEnrollment>(
    `/programs/${programId}/enrollments/${enrollmentId}`,
    dto
  );
  return data;
};

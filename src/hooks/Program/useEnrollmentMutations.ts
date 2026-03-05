import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enrollPatient } from "@/api/Program/enroll-patient.action";
import { updateEnrollmentStatus } from "@/api/Program/update-enrollment-status.action";
import { EnrollPatientDto } from "@/types/Program/ProgramEnrollment";
import { EnrollmentStatus } from "@/types/Program/ProgramEnrollment";

export const useEnrollmentMutations = (programId: string) => {
  const queryClient = useQueryClient();

  const enrollMutation = useMutation({
    mutationFn: (dto: EnrollPatientDto) => enrollPatient(programId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["program-enrollments", programId],
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      enrollmentId,
      status,
    }: {
      enrollmentId: string;
      status: EnrollmentStatus;
    }) => updateEnrollmentStatus(programId, enrollmentId, { status }),
    onSuccess: (_, { enrollmentId }) => {
      queryClient.invalidateQueries({
        queryKey: ["program-enrollments", programId],
      });
      queryClient.invalidateQueries({
        queryKey: ["enrollment", programId, enrollmentId],
      });
    },
  });

  return {
    enrollPatientMutation: enrollMutation,
    updateEnrollmentStatusMutation: updateStatusMutation,
  };
};

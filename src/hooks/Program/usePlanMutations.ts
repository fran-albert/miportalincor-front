import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPlanVersion } from "@/api/Program/create-plan-version.action";
import { CreatePlanVersionDto } from "@/types/Program/ProgramPlan";

export const usePlanMutations = (enrollmentId: string) => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (dto: CreatePlanVersionDto) =>
      createPlanVersion(enrollmentId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["plan-versions", enrollmentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["current-plan", enrollmentId],
      });
    },
  });

  return {
    createPlanVersionMutation: createMutation,
  };
};

import { useQuery } from "@tanstack/react-query";
import { getCurrentPlan } from "@/api/Program/get-current-plan.action";

export const useCurrentPlan = (enrollmentId: string) => {
  const {
    data: currentPlan,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["current-plan", enrollmentId],
    queryFn: () => getCurrentPlan(enrollmentId),
    staleTime: 1000 * 60,
    enabled: !!enrollmentId,
  });

  return { currentPlan, isLoading, isError, error, isFetching };
};

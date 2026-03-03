import { useQuery } from "@tanstack/react-query";
import { getPlanVersions } from "@/api/Program/get-plan-versions.action";

export const usePlanVersions = (enrollmentId: string) => {
  const {
    data: planVersions,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["plan-versions", enrollmentId],
    queryFn: () => getPlanVersions(enrollmentId),
    staleTime: 1000 * 60,
    enabled: !!enrollmentId,
  });

  return {
    planVersions: planVersions ?? [],
    isLoading,
    isError,
    error,
    isFetching,
  };
};

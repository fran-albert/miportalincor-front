import { useQuery } from "@tanstack/react-query";
import { getCompliance } from "@/api/Program/get-compliance.action";

export const useCompliance = (
  enrollmentId: string,
  from: string,
  to: string
) => {
  const {
    data: compliance,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["compliance", enrollmentId, from, to],
    queryFn: () => getCompliance(enrollmentId, from, to),
    staleTime: 1000 * 60,
    enabled: !!enrollmentId && !!from && !!to,
  });

  return { compliance, isLoading, isError, error, isFetching };
};

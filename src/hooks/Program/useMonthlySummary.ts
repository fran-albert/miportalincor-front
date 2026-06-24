import { useQuery } from "@tanstack/react-query";
import { getMonthlySummary } from "@/api/Program/get-monthly-summary.action";

export const useMonthlySummary = (
  enrollmentId: string,
  year: number,
  month: number
) => {
  const {
    data: monthlySummary,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["monthly-summary", enrollmentId, year, month],
    queryFn: () => getMonthlySummary(enrollmentId, year, month),
    staleTime: 1000 * 30,
    enabled: !!enrollmentId && !!year && !!month,
  });

  return {
    monthlySummary,
    isLoading,
    isError,
    error,
    isFetching,
  };
};

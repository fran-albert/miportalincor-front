import { useQuery } from "@tanstack/react-query";
import { getMeasurements } from "@/api/Program/clinical-intake.actions";

export const useMeasurements = (
  enrollmentId: string,
  enabled: boolean = true
) => {
  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["program-measurements", enrollmentId],
    queryFn: () => getMeasurements(enrollmentId),
    staleTime: 1000 * 60,
    enabled: enabled && !!enrollmentId,
  });

  return { series: data, isLoading, isError, error, isFetching };
};

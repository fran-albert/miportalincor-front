import { useQuery } from "@tanstack/react-query";
import { getProgramActivities } from "@/api/Program/get-activities.action";

export const useProgramActivities = (programId: string) => {
  const {
    data: activities,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["program-activities", programId],
    queryFn: () => getProgramActivities(programId),
    staleTime: 1000 * 60,
    enabled: !!programId,
  });

  return {
    activities: activities ?? [],
    isLoading,
    isError,
    error,
    isFetching,
  };
};

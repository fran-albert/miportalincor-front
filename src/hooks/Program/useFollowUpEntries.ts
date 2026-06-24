import { useQuery } from "@tanstack/react-query";
import { getFollowUpEntries } from "@/api/Program/get-follow-up.action";

export const useFollowUpEntries = (enrollmentId: string) => {
  const {
    data: entries,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["follow-up", enrollmentId],
    queryFn: () => getFollowUpEntries(enrollmentId),
    staleTime: 1000 * 30,
    enabled: !!enrollmentId,
  });

  return { entries: entries ?? [], isLoading, isError, error, isFetching };
};

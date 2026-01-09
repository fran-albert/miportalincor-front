import { useQuery } from "@tanstack/react-query";
import { getOverturnById } from "@/api/Overturns";

interface UseOverturnProps {
  id: number;
  enabled?: boolean;
}

export const useOverturn = ({ id, enabled = true }: UseOverturnProps) => {
  const query = useQuery({
    queryKey: ['overturn', id],
    queryFn: () => getOverturnById(id),
    staleTime: 1000 * 60, // 1 minute
    enabled: enabled && id > 0,
  });

  return {
    overturn: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
};

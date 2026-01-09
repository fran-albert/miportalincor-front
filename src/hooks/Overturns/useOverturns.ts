import { useQuery } from "@tanstack/react-query";
import { getAllOverturns, GetAllOverturnsParams } from "@/api/Overturns";

export const useOverturns = (params?: GetAllOverturnsParams) => {
  const query = useQuery({
    queryKey: ['overturns', params],
    queryFn: () => getAllOverturns(params),
    staleTime: 1000 * 60, // 1 minute
  });

  return {
    overturns: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
};

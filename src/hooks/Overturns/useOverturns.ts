import { useQuery } from "@tanstack/react-query";
import { getAllOverturns, GetAllOverturnsParams } from "@/api/Overturns";

interface UseOverturnsOptions {
  params?: GetAllOverturnsParams;
  enabled?: boolean;
}

function isOptionsObject(value: unknown): value is UseOverturnsOptions {
  return typeof value === 'object' && value !== null && ('enabled' in value || 'params' in value);
}

export const useOverturns = (paramsOrOptions?: GetAllOverturnsParams | UseOverturnsOptions) => {
  const params: GetAllOverturnsParams | undefined = isOptionsObject(paramsOrOptions)
    ? paramsOrOptions.params
    : paramsOrOptions;
  const enabled = isOptionsObject(paramsOrOptions) ? paramsOrOptions.enabled : true;

  const query = useQuery({
    queryKey: ['overturns', params],
    queryFn: () => getAllOverturns(params),
    staleTime: 1000 * 60, // 1 minute
    enabled,
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

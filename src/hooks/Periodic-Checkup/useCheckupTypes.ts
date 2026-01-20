import { useQuery } from "@tanstack/react-query";
import { getCheckupTypes, getActiveCheckupTypes } from "@/api/Periodic-Checkup";

export const useCheckupTypes = () => {
  const query = useQuery({
    queryKey: ['checkup-types'],
    queryFn: getCheckupTypes,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    checkupTypes: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useActiveCheckupTypes = () => {
  const query = useQuery({
    queryKey: ['checkup-types', 'active'],
    queryFn: getActiveCheckupTypes,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    checkupTypes: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

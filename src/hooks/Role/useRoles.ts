import { getAllRoles, Role } from "@/api/Role/get-all-roles.action";
import { useQuery } from "@tanstack/react-query";

export const useRoles = () => {
  const {
    isLoading,
    isError,
    error,
    data: roles = [],
    isFetching,
    refetch
  } = useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: getAllRoles,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    roles,
    error,
    isLoading,
    isError,
    isFetching,
    refetch,
  };
};

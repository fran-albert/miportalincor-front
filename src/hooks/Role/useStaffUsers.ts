import { getStaffUsers, StaffUser } from "@/api/Role/get-staff-users.action";
import { useQuery } from "@tanstack/react-query";

export const useStaffUsers = () => {
  const {
    isLoading,
    isError,
    error,
    data: staffUsers = [],
    isFetching,
    refetch
  } = useQuery<StaffUser[]>({
    queryKey: ['staff-users'],
    queryFn: getStaffUsers,
    staleTime: 1000 * 60, // 1 minute
  });

  return {
    staffUsers,
    error,
    isLoading,
    isError,
    isFetching,
    refetch,
  };
};

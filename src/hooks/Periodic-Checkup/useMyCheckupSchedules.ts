import { useQuery } from "@tanstack/react-query";
import { getMyCheckupSchedules } from "@/api/Periodic-Checkup/get-my-checkup-schedules.action";
import useUserRole from "@/hooks/useRoles";

export const useMyCheckupSchedules = (enabled = true) => {
  const { session, isPatient } = useUserRole();
  const userId = session?.id;

  const query = useQuery({
    queryKey: ['my-checkup-schedules', userId],
    queryFn: () => getMyCheckupSchedules(userId!),
    enabled: enabled && isPatient && !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    schedules: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
};

import { useQuery } from "@tanstack/react-query";
import { getTodayOverturnsByDoctor } from "@/api/Overturns";
import { OverturnStatus } from "@/types/Overturn/Overturn";

interface UseDoctorTodayOverturnsProps {
  doctorId: number;
  enabled?: boolean;
  refetchInterval?: number;
}

export const useDoctorTodayOverturns = ({
  doctorId,
  enabled = true,
  refetchInterval = 30000 // 30 seconds
}: UseDoctorTodayOverturnsProps) => {
  const query = useQuery({
    queryKey: ['doctorTodayOverturns', doctorId],
    queryFn: () => getTodayOverturnsByDoctor(doctorId),
    staleTime: 1000 * 15, // 15 seconds
    refetchInterval: enabled ? refetchInterval : false,
    enabled: enabled && doctorId > 0,
  });

  // Filter by status
  const waitingOverturns = query.data?.filter(
    overturn => overturn.status === OverturnStatus.WAITING
  ) ?? [];

  const pendingOverturns = query.data?.filter(
    overturn => overturn.status === OverturnStatus.PENDING
  ) ?? [];

  const attendingOverturns = query.data?.filter(
    overturn => overturn.status === OverturnStatus.ATTENDING
  ) ?? [];

  return {
    overturns: query.data ?? [],
    waitingOverturns,
    pendingOverturns,
    attendingOverturns,
    total: query.data?.length ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
};

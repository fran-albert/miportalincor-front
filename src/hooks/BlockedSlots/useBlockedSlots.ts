import { useQuery } from "@tanstack/react-query";
import { getBlockedSlotsByDoctorAndRange } from "@/api/BlockedSlots";

interface UseBlockedSlotsParams {
  doctorId: number;
  startDate: string;
  endDate: string;
  enabled?: boolean;
}

export const useBlockedSlots = ({
  doctorId,
  startDate,
  endDate,
  enabled = true,
}: UseBlockedSlotsParams) => {
  const query = useQuery({
    queryKey: ["blockedSlots", doctorId, startDate, endDate],
    queryFn: () => getBlockedSlotsByDoctorAndRange(doctorId, startDate, endDate),
    enabled: enabled && !!doctorId && !!startDate && !!endDate,
    staleTime: 1000 * 60, // 1 minute
  });

  return {
    blockedSlots: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

import { useQuery } from "@tanstack/react-query";
import { getAvailableSlots } from "@/api/Appointments";

interface UseAvailableSlotsProps {
  doctorId: number;
  date: string;
  consultationTypeId?: number;
  enabled?: boolean;
}

export const useAvailableSlots = ({ doctorId, date, consultationTypeId, enabled = true }: UseAvailableSlotsProps) => {
  const query = useQuery({
    queryKey: ['availableSlots', doctorId, date, consultationTypeId ?? null],
    queryFn: () => getAvailableSlots(doctorId, date, consultationTypeId),
    staleTime: 1000 * 120, // 2 minutes
    enabled: enabled && doctorId > 0 && !!date,
  });

  return {
    slots: query.data ?? [],
    availableSlots: query.data?.filter(slot => slot.available) ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
};

import { useQuery } from "@tanstack/react-query";
import { getAvailableSlots } from "@/api/Appointments";

interface UseAvailableSlotsProps {
  doctorId: number;
  date: string;
  enabled?: boolean;
}

export const useAvailableSlots = ({ doctorId, date, enabled = true }: UseAvailableSlotsProps) => {
  const query = useQuery({
    queryKey: ['availableSlots', doctorId, date],
    queryFn: () => getAvailableSlots(doctorId, date),
    staleTime: 1000 * 30, // 30 seconds - slots can change frequently
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

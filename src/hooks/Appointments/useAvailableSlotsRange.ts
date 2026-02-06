import { useQuery } from "@tanstack/react-query";
import { getAvailableSlotsRange } from "@/api/Appointments";
import { formatDateForCalendar } from "@/common/helpers/timezone";
import { useMemo } from "react";

interface SlotWithDate {
  date: string;
  hour: string;
}

interface UseAvailableSlotsRangeProps {
  doctorId: number;
  startDate: Date;
  endDate: Date;
  enabled?: boolean;
}

export const useAvailableSlotsRange = ({
  doctorId,
  startDate,
  endDate,
  enabled = true,
}: UseAvailableSlotsRangeProps) => {
  const startDateStr = formatDateForCalendar(startDate);
  const endDateStr = formatDateForCalendar(endDate);

  const query = useQuery({
    queryKey: ["availableSlotsRange", doctorId, startDateStr, endDateStr],
    queryFn: () => getAvailableSlotsRange(doctorId, startDateStr, endDateStr),
    staleTime: 1000 * 120, // 2 minutes
    enabled: enabled && doctorId > 0,
  });

  // Transform Record<string, string[]> to SlotWithDate[]
  const slots = useMemo<SlotWithDate[]>(() => {
    if (!query.data) return [];
    const result: SlotWithDate[] = [];
    for (const [date, hours] of Object.entries(query.data)) {
      for (const hour of hours) {
        result.push({ date, hour });
      }
    }
    return result;
  }, [query.data]);

  return {
    slots,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  };
};

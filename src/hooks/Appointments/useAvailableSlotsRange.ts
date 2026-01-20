import { useQueries } from "@tanstack/react-query";
import { getAvailableSlots } from "@/api/Appointments";
import { formatDateForCalendar } from "@/common/helpers/timezone";
import { eachDayOfInterval } from "date-fns";

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
  // Generate array of dates in range
  const dates = eachDayOfInterval({ start: startDate, end: endDate }).map(
    (date) => formatDateForCalendar(date)
  );

  // Create queries for each date
  const queries = useQueries({
    queries: dates.map((date) => ({
      queryKey: ["availableSlots", doctorId, date],
      queryFn: () => getAvailableSlots(doctorId, date),
      staleTime: 1000 * 30,
      enabled: enabled && doctorId > 0,
    })),
  });

  // Combine all results into a single array with date info
  const allSlots: SlotWithDate[] = [];
  queries.forEach((query, index) => {
    if (query.data) {
      query.data.forEach((slot) => {
        allSlots.push({
          date: dates[index],
          hour: slot.hour,
        });
      });
    }
  });

  const isLoading = queries.some((q) => q.isLoading);
  const isFetching = queries.some((q) => q.isFetching);

  return {
    slots: allSlots,
    isLoading,
    isFetching,
  };
};

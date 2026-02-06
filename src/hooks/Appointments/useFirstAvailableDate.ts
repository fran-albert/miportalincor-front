import { useQuery } from "@tanstack/react-query";
import { getAvailableSlotsRange } from "@/api/Appointments";
import { formatDateForCalendar } from "@/common/helpers/timezone";
import { startOfMonth, endOfMonth, addMonths } from "date-fns";

interface UseFirstAvailableDateProps {
  doctorId: number | undefined;
  maxMonthsAhead?: number;
  enabled?: boolean;
}

interface UseFirstAvailableDateResult {
  firstAvailableDate: Date | null;
  isSearching: boolean;
  hasSearched: boolean;
}

/**
 * Searches month by month (max 6 API calls) for the first date with available slots.
 * Uses the bulk slots-range endpoint instead of individual day requests.
 */
const searchFirstAvailableDate = async (
  doctorId: number,
  maxMonthsAhead: number
): Promise<Date | null> => {
  const today = new Date();

  for (let monthOffset = 0; monthOffset <= maxMonthsAhead; monthOffset++) {
    const targetMonth = addMonths(today, monthOffset);
    const searchStart = monthOffset === 0 ? today : startOfMonth(targetMonth);
    const searchEnd = endOfMonth(targetMonth);

    const startDateStr = formatDateForCalendar(searchStart);
    const endDateStr = formatDateForCalendar(searchEnd);

    try {
      const slotsMap = await getAvailableSlotsRange(
        doctorId,
        startDateStr,
        endDateStr
      );

      // Find the earliest date with slots
      const datesWithSlots = Object.keys(slotsMap)
        .filter((date) => slotsMap[date].length > 0)
        .sort();

      if (datesWithSlots.length > 0) {
        return new Date(datesWithSlots[0] + "T12:00:00");
      }
    } catch {
      // On error, continue to next month
    }
  }

  return null;
};

export const useFirstAvailableDate = ({
  doctorId,
  maxMonthsAhead = 6,
  enabled = true,
}: UseFirstAvailableDateProps): UseFirstAvailableDateResult => {
  const query = useQuery({
    queryKey: ["firstAvailableDate", doctorId, maxMonthsAhead],
    queryFn: () => searchFirstAvailableDate(doctorId!, maxMonthsAhead),
    enabled: enabled && !!doctorId && doctorId > 0,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    firstAvailableDate: query.data ?? null,
    isSearching: query.isLoading,
    hasSearched: !query.isLoading && query.isFetched,
  };
};

// Helper to clear cache (useful when availability changes)
export const clearFirstAvailableDateCache = (_doctorId?: number) => {
  // React Query cache invalidation should be used instead
  // This is kept for backwards compatibility but is now a no-op
  // Use queryClient.invalidateQueries({ queryKey: ['firstAvailableDate'] }) instead
};

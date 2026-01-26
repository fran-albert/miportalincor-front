import { useState, useEffect, useRef } from "react";
import { getAvailableSlots } from "@/api/Appointments";
import { formatDateForCalendar } from "@/common/helpers/timezone";
import { startOfMonth, endOfMonth, addMonths, eachDayOfInterval } from "date-fns";

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

// Cache para evitar búsquedas repetidas por médico
const searchCache = new Map<number, Date | null>();

export const useFirstAvailableDate = ({
  doctorId,
  maxMonthsAhead = 6,
  enabled = true,
}: UseFirstAvailableDateProps): UseFirstAvailableDateResult => {
  const [firstAvailableDate, setFirstAvailableDate] = useState<Date | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastDoctorIdRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Reset state when doctorId changes
    if (doctorId !== lastDoctorIdRef.current) {
      setFirstAvailableDate(null);
      setHasSearched(false);
      lastDoctorIdRef.current = doctorId;
    }

    if (!enabled || !doctorId || doctorId <= 0) {
      return;
    }

    // Check cache first
    if (searchCache.has(doctorId)) {
      setFirstAvailableDate(searchCache.get(doctorId) || null);
      setHasSearched(true);
      return;
    }

    const searchForFirstSlot = async () => {
      // Cancel any previous search
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsSearching(true);

      try {
        const today = new Date();

        // Search month by month
        for (let monthOffset = 0; monthOffset <= maxMonthsAhead; monthOffset++) {
          const targetMonth = addMonths(today, monthOffset);
          const monthStart = startOfMonth(targetMonth);
          const monthEnd = endOfMonth(targetMonth);

          // For current month, start from today
          const searchStart = monthOffset === 0 ? today : monthStart;

          const dates = eachDayOfInterval({ start: searchStart, end: monthEnd });

          // Search each day in the month (in batches to avoid too many requests)
          for (let i = 0; i < dates.length; i += 5) {
            const batch = dates.slice(i, i + 5);

            const results = await Promise.all(
              batch.map(async (date) => {
                try {
                  const dateStr = formatDateForCalendar(date);
                  const slots = await getAvailableSlots(doctorId, dateStr);
                  return { date, hasSlots: slots.length > 0 };
                } catch {
                  return { date, hasSlots: false };
                }
              })
            );

            // Check if any day has slots
            const foundDay = results.find((r) => r.hasSlots);
            if (foundDay) {
              const foundDate = foundDay.date;
              searchCache.set(doctorId, foundDate);
              setFirstAvailableDate(foundDate);
              setIsSearching(false);
              setHasSearched(true);
              return;
            }
          }
        }

        // No slots found in the search range
        searchCache.set(doctorId, null);
        setFirstAvailableDate(null);
        setIsSearching(false);
        setHasSearched(true);
      } catch (error) {
        // On error, just stop searching
        setIsSearching(false);
        setHasSearched(true);
      }
    };

    searchForFirstSlot();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [doctorId, maxMonthsAhead, enabled]);

  return {
    firstAvailableDate,
    isSearching,
    hasSearched,
  };
};

// Helper to clear cache (useful when availability changes)
export const clearFirstAvailableDateCache = (doctorId?: number) => {
  if (doctorId) {
    searchCache.delete(doctorId);
  } else {
    searchCache.clear();
  }
};

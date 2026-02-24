import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  getMyDashboard,
  type DoctorDashboardParams,
  type DoctorDashboardResponse,
} from "@/api/Doctor/get-my-dashboard.action";

interface SlotWithDate {
  date: string;
  hour: string;
}

interface UseDoctorDashboardProps {
  dateFrom: string;
  dateTo: string;
  selectedWeekStart: string;
  selectedWeekEnd: string;
  enabled?: boolean;
}

export const useDoctorDashboard = ({
  dateFrom,
  dateTo,
  selectedWeekStart,
  selectedWeekEnd,
  enabled = true,
}: UseDoctorDashboardProps) => {
  const params: DoctorDashboardParams = {
    dateFrom,
    dateTo,
    selectedWeekStart,
    selectedWeekEnd,
  };

  const query = useQuery<DoctorDashboardResponse>({
    queryKey: ["doctorDashboard", dateFrom, dateTo, selectedWeekStart, selectedWeekEnd],
    queryFn: () => getMyDashboard(params),
    staleTime: 1000 * 60, // 1 minute
    enabled,
  });

  const dashboard = query.data;

  const availableSlots = useMemo<SlotWithDate[]>(() => {
    if (!dashboard?.slotsRange) return [];
    const result: SlotWithDate[] = [];
    for (const [date, hours] of Object.entries(dashboard.slotsRange)) {
      for (const hour of hours) {
        result.push({ date, hour });
      }
    }
    return result;
  }, [dashboard?.slotsRange]);

  const slotDuration = useMemo(() => {
    if (!dashboard?.availability || dashboard.availability.length === 0) {
      return 30;
    }
    const durations = dashboard.availability
      .map((a) => a.slotDuration)
      .filter((d) => d > 0);
    return durations.length > 0 ? Math.min(...durations) : 30;
  }, [dashboard?.availability]);

  return {
    dashboard,
    doctorProfile: dashboard?.doctor ?? null,
    appointments: dashboard?.calendarAppointments ?? [],
    overturns: dashboard?.calendarOverturns ?? [],
    availableSlots,
    blockedSlots: dashboard?.blockedSlots ?? [],
    doctorAbsences: dashboard?.absences ?? [],
    holidays: dashboard?.holidays ?? [],
    doctorAvailabilities: dashboard?.availability ?? [],
    slotDuration,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
};

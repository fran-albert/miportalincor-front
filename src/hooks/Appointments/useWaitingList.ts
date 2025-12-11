import { useQuery } from "@tanstack/react-query";
import { getTodayAppointmentsByDoctor } from "@/api/Appointments";
import { AppointmentStatus } from "@/types/Appointment/Appointment";

interface UseWaitingListProps {
  doctorId: number;
  enabled?: boolean;
  refetchInterval?: number;
}

export const useWaitingList = ({
  doctorId,
  enabled = true,
  refetchInterval = 30000 // 30 seconds
}: UseWaitingListProps) => {
  const query = useQuery({
    queryKey: ['waitingList', doctorId],
    queryFn: () => getTodayAppointmentsByDoctor(doctorId),
    staleTime: 1000 * 15, // 15 seconds
    refetchInterval: enabled ? refetchInterval : false,
    enabled: enabled && doctorId > 0,
  });

  // Filter only WAITING appointments
  const waitingAppointments = query.data?.filter(
    appointment => appointment.status === AppointmentStatus.WAITING
  ) ?? [];

  // Get appointments currently being attended
  const attendingAppointments = query.data?.filter(
    appointment => appointment.status === AppointmentStatus.ATTENDING
  ) ?? [];

  // Get all pending appointments for today
  const pendingAppointments = query.data?.filter(
    appointment => appointment.status === AppointmentStatus.PENDING
  ) ?? [];

  return {
    waitingList: waitingAppointments,
    attendingList: attendingAppointments,
    pendingList: pendingAppointments,
    allTodayAppointments: query.data ?? [],
    waitingCount: waitingAppointments.length,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
};

import { useQuery } from "@tanstack/react-query";
import { getTodayAppointmentsByDoctor } from "@/api/Appointments";

interface UseDoctorTodayAppointmentsProps {
  doctorId: number;
  enabled?: boolean;
}

export const useDoctorTodayAppointments = ({
  doctorId,
  enabled = true
}: UseDoctorTodayAppointmentsProps) => {
  const query = useQuery({
    queryKey: ['doctorTodayAppointments', doctorId],
    queryFn: () => getTodayAppointmentsByDoctor(doctorId),
    staleTime: 1000 * 60, // 1 minute
    enabled: enabled && doctorId > 0,
  });

  return {
    appointments: query.data ?? [],
    total: query.data?.length ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
};

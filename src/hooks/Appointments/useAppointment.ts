import { useQuery } from "@tanstack/react-query";
import { getAppointmentById } from "@/api/Appointments";

interface UseAppointmentProps {
  id: number;
  enabled?: boolean;
}

export const useAppointment = ({ id, enabled = true }: UseAppointmentProps) => {
  const query = useQuery({
    queryKey: ['appointment', id],
    queryFn: () => getAppointmentById(id),
    staleTime: 1000 * 60, // 1 minute
    enabled: enabled && id > 0,
  });

  return {
    appointment: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
};

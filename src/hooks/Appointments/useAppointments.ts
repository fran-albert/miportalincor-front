import { useQuery } from "@tanstack/react-query";
import { getAllAppointments, GetAllAppointmentsParams } from "@/api/Appointments";

export const useAppointments = (params?: GetAllAppointmentsParams) => {
  const query = useQuery({
    queryKey: ['appointments', params],
    queryFn: () => getAllAppointments(params),
    staleTime: 1000 * 60, // 1 minute
  });

  return {
    appointments: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
};

import { useQuery } from "@tanstack/react-query";
import { getAllAppointments, GetAllAppointmentsParams } from "@/api/Appointments";

interface UseAppointmentsOptions {
  params?: GetAllAppointmentsParams;
  enabled?: boolean;
}

function isOptionsObject(value: unknown): value is UseAppointmentsOptions {
  return typeof value === 'object' && value !== null && ('enabled' in value || 'params' in value);
}

export const useAppointments = (paramsOrOptions?: GetAllAppointmentsParams | UseAppointmentsOptions) => {
  const params: GetAllAppointmentsParams | undefined = isOptionsObject(paramsOrOptions)
    ? paramsOrOptions.params
    : paramsOrOptions;
  const enabled = isOptionsObject(paramsOrOptions) ? paramsOrOptions.enabled : true;

  const query = useQuery({
    queryKey: ['appointments', params],
    queryFn: () => getAllAppointments(params),
    staleTime: 1000 * 60, // 1 minute
    enabled,
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

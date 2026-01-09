import { useQuery } from "@tanstack/react-query";
import { getAppointmentsByPatient } from "@/api/Appointments";

interface UsePatientAppointmentsProps {
  patientId: number;
  enabled?: boolean;
}

export const usePatientAppointments = ({
  patientId,
  enabled = true
}: UsePatientAppointmentsProps) => {
  const query = useQuery({
    queryKey: ['patientAppointments', patientId],
    queryFn: () => getAppointmentsByPatient(patientId),
    staleTime: 1000 * 60, // 1 minute
    enabled: enabled && patientId > 0,
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

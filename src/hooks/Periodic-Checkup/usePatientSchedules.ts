import { useQuery } from "@tanstack/react-query";
import { getPatientSchedules } from "@/api/Periodic-Checkup";

export const usePatientSchedules = (patientId: number | string | undefined) => {
  const numericPatientId = patientId ? Number(patientId) : undefined;

  const query = useQuery({
    queryKey: ['patient-checkup-schedules', numericPatientId],
    queryFn: () => getPatientSchedules(numericPatientId!),
    enabled: !!numericPatientId && !isNaN(numericPatientId),
    staleTime: 1000 * 60, // 1 minute
  });

  return {
    schedules: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

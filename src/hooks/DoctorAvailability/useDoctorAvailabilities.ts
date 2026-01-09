import { useQuery } from "@tanstack/react-query";
import { getDoctorAvailabilities } from "@/api/DoctorAvailability";

interface UseDoctorAvailabilitiesProps {
  doctorId: number;
  enabled?: boolean;
}

export const useDoctorAvailabilities = ({
  doctorId,
  enabled = true
}: UseDoctorAvailabilitiesProps) => {
  const query = useQuery({
    queryKey: ['doctorAvailabilities', doctorId],
    queryFn: () => getDoctorAvailabilities(doctorId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: enabled && doctorId > 0,
  });

  return {
    availabilities: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

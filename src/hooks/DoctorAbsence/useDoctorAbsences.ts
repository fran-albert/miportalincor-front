import { useQuery } from "@tanstack/react-query";
import { getDoctorAbsences } from "@/api/DoctorAbsence";

interface UseDoctorAbsencesProps {
  doctorId: number;
  enabled?: boolean;
}

export const useDoctorAbsences = ({
  doctorId,
  enabled = true
}: UseDoctorAbsencesProps) => {
  const query = useQuery({
    queryKey: ['doctorAbsences', doctorId],
    queryFn: () => getDoctorAbsences(doctorId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: enabled && doctorId > 0,
  });

  return {
    absences: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

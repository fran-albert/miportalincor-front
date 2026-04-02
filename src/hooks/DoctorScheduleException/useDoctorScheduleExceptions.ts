import { useQuery } from "@tanstack/react-query";
import { getDoctorScheduleExceptions } from "@/api/DoctorScheduleException";

interface UseDoctorScheduleExceptionsProps {
  doctorId: number;
  enabled?: boolean;
}

export const useDoctorScheduleExceptions = ({
  doctorId,
  enabled = true,
}: UseDoctorScheduleExceptionsProps) => {
  const query = useQuery({
    queryKey: ["doctorScheduleExceptions", doctorId],
    queryFn: () => getDoctorScheduleExceptions(doctorId),
    staleTime: 1000 * 60 * 5,
    enabled: enabled && doctorId > 0,
  });

  return {
    exceptions: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

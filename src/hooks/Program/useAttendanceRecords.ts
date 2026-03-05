import { useQuery } from "@tanstack/react-query";
import { getAttendanceRecords } from "@/api/Program/get-attendance-records.action";

export const useAttendanceRecords = (enrollmentId: string) => {
  const {
    data: records,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["attendance-records", enrollmentId],
    queryFn: () => getAttendanceRecords(enrollmentId),
    staleTime: 1000 * 60,
    enabled: !!enrollmentId,
  });

  return { records: records ?? [], isLoading, isError, error, isFetching };
};

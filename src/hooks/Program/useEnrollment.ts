import { useQuery } from "@tanstack/react-query";
import { getEnrollmentById } from "@/api/Program/get-enrollment-by-id.action";

export const useEnrollment = (programId: string, enrollmentId: string) => {
  const {
    data: enrollment,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["enrollment", programId, enrollmentId],
    queryFn: () => getEnrollmentById(programId, enrollmentId),
    staleTime: 1000 * 60,
    enabled: !!programId && !!enrollmentId,
  });

  return { enrollment, isLoading, isError, error, isFetching };
};

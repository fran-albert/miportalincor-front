import { useQuery } from "@tanstack/react-query";
import { getProgramEnrollments } from "@/api/Program/get-enrollments.action";

export const useProgramEnrollments = (programId: string) => {
  const {
    data: enrollments,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["program-enrollments", programId],
    queryFn: () => getProgramEnrollments(programId),
    staleTime: 1000 * 60,
    enabled: !!programId,
  });

  return {
    enrollments: enrollments ?? [],
    isLoading,
    isError,
    error,
    isFetching,
  };
};

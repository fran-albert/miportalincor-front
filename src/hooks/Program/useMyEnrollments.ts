import { useQuery } from "@tanstack/react-query";
import { getMyEnrollments } from "@/api/Program/get-my-enrollments.action";

export const useMyEnrollments = () => {
  const {
    data: enrollments,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: getMyEnrollments,
    staleTime: 1000 * 60,
  });

  return {
    enrollments: enrollments ?? [],
    isLoading,
    isError,
    error,
    isFetching,
  };
};

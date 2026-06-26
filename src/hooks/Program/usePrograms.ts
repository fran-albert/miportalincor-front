import { useQuery } from "@tanstack/react-query";
import { getPrograms } from "@/api/Program/get-programs.action";

export const usePrograms = () => {
  const {
    data: programs,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["programs"],
    queryFn: getPrograms,
    staleTime: 1000 * 60,
  });

  return { programs: programs ?? [], isLoading, isError, error, isFetching };
};

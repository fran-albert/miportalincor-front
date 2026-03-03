import { useQuery } from "@tanstack/react-query";
import { getProgramById } from "@/api/Program/get-program-by-id.action";

export const useProgram = (id: string) => {
  const {
    data: program,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["program", id],
    queryFn: () => getProgramById(id),
    staleTime: 1000 * 60,
    enabled: !!id,
  });

  return { program, isLoading, isError, error, isFetching };
};

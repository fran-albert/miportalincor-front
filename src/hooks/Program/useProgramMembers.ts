import { useQuery } from "@tanstack/react-query";
import { getProgramMembers } from "@/api/Program/get-members.action";

export const useProgramMembers = (programId: string) => {
  const {
    data: members,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["program-members", programId],
    queryFn: () => getProgramMembers(programId),
    staleTime: 1000 * 60,
    enabled: !!programId,
  });

  return { members: members ?? [], isLoading, isError, error, isFetching };
};

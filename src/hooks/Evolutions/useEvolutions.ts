import { useQuery } from "@tanstack/react-query";
import { getEvolutionsByCollaboratorId } from "@/api/Evolutions/Collaborator/get-evolutionts-by-collaborator-id.action";

interface Props {
    collaboratorId: number;
    enabled?: boolean;
}

export const useEvolutions = ({ collaboratorId, enabled = true }: Props) => {
    const { isLoading, isError, error, data: evolutions = [], isFetching } = useQuery({
        queryKey: ['evolutions', collaboratorId],
        queryFn: () => getEvolutionsByCollaboratorId(collaboratorId),
        staleTime: 1000 * 60,
        enabled: enabled && !!collaboratorId
    });

    return {
        isLoading, 
        isError, 
        error, 
        evolutions, 
        isFetching
    }
}
import { getAllCollaborators } from "@/api/Collaborator/get-all-collaborators.action";
import { useQuery } from "@tanstack/react-query"

interface Props {
    auth: boolean;
    fetch: boolean;
}

export const useCollaborators = ({ auth, fetch }: Props) => {

    const { isLoading, isError, error, data: collaborators = [], isFetching } = useQuery({
        queryKey: ['collaborators'],
        queryFn: () => getAllCollaborators(),
        staleTime: 1000 * 60,
        enabled: auth && fetch
    });


    return {
        collaborators,
        error,
        isLoading,
        isError, isFetching,

    }

}
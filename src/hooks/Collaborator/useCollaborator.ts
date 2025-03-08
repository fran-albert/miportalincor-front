import { getCollaboratorById } from "@/api/Collaborator/get-collaborator-by-id.action";
import { useQuery } from "@tanstack/react-query"

interface Props {
    auth?: boolean;
    id: number
}

export const useCollaborator = ({ auth, id }: Props) => {

    const { isLoading, isError, error, data: collaborator, isFetching } = useQuery({
        queryKey: ['collaborator', id],
        queryFn: () => getCollaboratorById(id as number),
        staleTime: 1000 * 60,
        enabled: auth && id !== undefined,
    });


    return {
        collaborator,
        error,
        isLoading,
        isError, isFetching,
    }

}
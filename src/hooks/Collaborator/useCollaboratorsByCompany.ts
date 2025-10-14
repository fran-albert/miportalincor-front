import { getCollaboratorsByCompany } from "@/api/Collaborator/get-collaborators-by-company.action";
import { useQuery } from "@tanstack/react-query";

interface Props {
    companyId: number;
    auth: boolean;
    fetch: boolean;
}

export const useCollaboratorsByCompany = ({ companyId, auth, fetch }: Props) => {

    const { isLoading, isError, error, data: collaborators = [], isFetching } = useQuery({
        queryKey: ['collaborators-by-company', companyId],
        queryFn: () => getCollaboratorsByCompany(companyId),
        staleTime: 1000 * 60 * 5,
        enabled: auth && fetch && !!companyId
    });

    return {
        collaborators,
        error,
        isLoading,
        isError,
        isFetching,
    }
}

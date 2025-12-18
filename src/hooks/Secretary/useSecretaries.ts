import { getSecretaries } from "@/api/Secretary/get-all-secretaries.action";
import { useQuery } from "@tanstack/react-query"

interface Props {
    auth: boolean;
    fetchSecretaries: boolean;
}

export const useSecretaries = ({ auth, fetchSecretaries }: Props) => {
    const { isLoading, isError, error, data: secretaries = [], isFetching } = useQuery({
        queryKey: ['secretaries'],
        queryFn: () => getSecretaries(),
        staleTime: 1000 * 60,
        enabled: auth && fetchSecretaries
    });

    return {
        secretaries,
        error,
        isLoading,
        isError,
        isFetching,
    }
}

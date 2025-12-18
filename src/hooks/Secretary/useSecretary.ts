import { getSecretaryById } from "@/api/Secretary/get-secretary-by-id.action";
import { useQuery } from "@tanstack/react-query"

interface Props {
    id: string;
    enabled?: boolean;
}

export const useSecretary = ({ id, enabled = true }: Props) => {
    const { isLoading, isError, error, data: secretary, isFetching } = useQuery({
        queryKey: ['secretary', id],
        queryFn: () => getSecretaryById(id),
        staleTime: 1000 * 60,
        enabled: enabled && !!id
    });

    return {
        secretary,
        error,
        isLoading,
        isError,
        isFetching,
    }
}

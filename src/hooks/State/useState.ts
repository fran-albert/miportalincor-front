import { getStates } from "@/api/State/get-state";
import { useQuery } from "@tanstack/react-query"

export const useState = () => {
    const { isLoading, isError, error, data: states = [], isFetching } = useQuery({
        queryKey: ['state'],
        queryFn: () => getStates(),
        staleTime: 1000 * 60,
    });

    return {
        isLoading, isError, error, states, isFetching
    }

}
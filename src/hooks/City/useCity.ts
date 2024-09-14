import { getCityByState } from "@/api/City/get-city-by-state.action";
import { useQuery } from "@tanstack/react-query"

interface Props {
    idState: number;
}

export const useCity = ({
    idState
}: Props) => {
    const { isLoading, isError, error, data: cities = [], isFetching } = useQuery({
        queryKey: ['city', { idState }],
        queryFn: () => getCityByState(idState),
        staleTime: 1000 * 60,
    });

    return {
        isLoading, isError, error, cities, isFetching
    }

}
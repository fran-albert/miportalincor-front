import { getAllDataTypeByCategories } from "@/api/Data-Type/get-all-data-type-by-category.action";
import { useQuery } from "@tanstack/react-query"

interface Props {
    auth: boolean;
    fetch: boolean;
    categories: string[];
}

export const useDataTypes = ({ auth, fetch, categories }: Props) => {

    const { isLoading, isError, error, data = [], isFetching } = useQuery({
        queryKey: ['data-types', categories],
        queryFn: () => getAllDataTypeByCategories(categories),
        staleTime: 1000 * 60,
        enabled: auth && fetch
    });


    return {
        data,
        error,
        isLoading,
        isError, isFetching,

    }

}
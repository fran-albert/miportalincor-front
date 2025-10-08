import { getAllDataTypeByCategoriesLaboral, getAllDataTypeByCategoriesIncor } from "@/api/Data-Type/get-all-data-type-by-category.action";
import { useQuery } from "@tanstack/react-query"

interface Props {
    auth: boolean;
    fetch: boolean;
    categories: string[];
    apiType?: 'laboral' | 'incor';
}

export const useDataTypes = ({ auth, fetch, categories, apiType = 'laboral' }: Props) => {

    const apiFunction = apiType === 'incor' ? getAllDataTypeByCategoriesIncor : getAllDataTypeByCategoriesLaboral;

    const { isLoading, isError, error, data = [], isFetching } = useQuery({
        queryKey: ['data-types', categories, apiType],
        queryFn: () => apiFunction(categories),
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
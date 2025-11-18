import { getAllCompany } from "@/api/Company/get-all-company.action";
import { useQuery } from "@tanstack/react-query"

interface Props {
    auth: boolean;
    fetch: boolean;
}

export const useCompanies = ({ auth, fetch }: Props) => {

    const { isLoading, isError, error, data: companies = [], isFetching } = useQuery({
        queryKey: ['companies'],
        queryFn: () => getAllCompany(),
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 15,
        enabled: auth && fetch
    });


    return {
        companies,
        error,
        isLoading,
        isError, isFetching,

    }

}
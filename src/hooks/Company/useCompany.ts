import { getCompanyById } from "@/api/Company/get-company-by-id.action";
import { useQuery } from "@tanstack/react-query";

interface Props {
    id: number;
    auth: boolean;
    fetch: boolean;
}

export const useCompany = ({ id, auth, fetch }: Props) => {

    const { isLoading, isError, error, data: company, isFetching } = useQuery({
        queryKey: ['company', id],
        queryFn: () => getCompanyById(id),
        staleTime: 1000 * 60 * 15,
        gcTime: 1000 * 60 * 30,
        enabled: auth && fetch && !!id
    });

    return {
        company,
        error,
        isLoading,
        isError,
        isFetching,
    }
}

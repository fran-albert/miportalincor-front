import { getCompanyById } from "@/api/Company/get-company-by-id.action";
import { useQueryClient } from "@tanstack/react-query";

export const usePrefetchCompany = () => {

    const queryClient = useQueryClient();

    const preFetchCompany = async (id: number) => {

        await queryClient.prefetchQuery({
            queryKey: ['company', id],
            queryFn: () => getCompanyById(id),
        })
    };

    return preFetchCompany;
}

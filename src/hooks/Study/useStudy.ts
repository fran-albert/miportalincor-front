import { getStudiesByUserId } from "@/api/Study/get-studies-by-idUser.action";
import { useQuery } from "@tanstack/react-query"

interface Props {
    idUser?: number;
    fetchStudiesByUserId?: boolean;
}

export const useStudy = ({ idUser, fetchStudiesByUserId = false }: Props) => {
    const {
        isLoading,
        isError: isErrorStudiesByUserId,
        error: errorStudiesByUserId,
        data: studiesByUserId,
        isRefetching
    } = useQuery({
        queryKey: ["studiesByUserId", idUser],
        queryFn: () => getStudiesByUserId(Number(idUser)),
        staleTime: 1000 * 60,
        enabled: !!idUser && fetchStudiesByUserId
    });

    return {
        isLoading,
        isErrorStudiesByUserId,
        errorStudiesByUserId,
        studiesByUserId,
        isRefetching
    }
}

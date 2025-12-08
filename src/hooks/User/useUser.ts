import { getUserById } from "@/api/User/get-user-by-id.action";
import { useQuery } from "@tanstack/react-query"

interface Props {
    auth: boolean;
    id: string;
}

export const useUser = ({ auth, id }: Props) => {

    const { isLoading, isError, error, data: user, isFetching } = useQuery({
        queryKey: ['user', id],
        queryFn: () => getUserById(id),
        staleTime: 1000 * 60,
        enabled: auth && !!id,
    });


    return {
        user,
        error,
        isLoading,
        isError, isFetching,
    }

}
import { getAllUsers } from "@/api/User/get-all-users.action";
import { useQuery } from "@tanstack/react-query";

export const useUsers = () => {
    const { isLoading, isError, error, data: users = [], isFetching, refetch } = useQuery({
        queryKey: ['users'],
        queryFn: getAllUsers,
        staleTime: 1000 * 60,
    });

    return {
        users,
        error,
        isLoading,
        isError,
        isFetching,
        refetch,
    };
};

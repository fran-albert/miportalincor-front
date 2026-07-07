import {
  getAllUsers,
  GetUsersParams,
  PaginatedUsers,
} from "@/api/User/get-all-users.action";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const useUsers = (params: GetUsersParams = {}) => {
  const { page = 1, limit = 20, search = "", status = "active" } = params;

  const { isLoading, isError, error, data, isFetching, refetch } =
    useQuery<PaginatedUsers>({
      queryKey: ["users", { page, limit, search, status }],
      queryFn: () => getAllUsers({ page, limit, search, status }),
      // Mantiene la pagina anterior visible mientras carga la nueva (sin
      // parpadeo ni "recarga" al cambiar de pagina o buscar).
      placeholderData: keepPreviousData,
      staleTime: 1000 * 30,
    });

  return {
    users: data?.users ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? page,
    limit: data?.limit ?? limit,
    error,
    isLoading,
    isError,
    isFetching,
    refetch,
  };
};
